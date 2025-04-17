import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { AccountingCategory } from '../entity/AccountingCategory.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import { MasterAccount } from '../entity/MasterAccount.js'
import { Transaction } from '../entity/Transaction.js'
import { EEntryType, TransactionLine } from '../entity/TransactionLine.js'
import { format } from 'date-fns'
import { instanceToPlain } from 'class-transformer'
import { recalculateClosingAmount } from '../util/recalculateClosingAmount.js'

const router = express.Router()

const groupRepository = db.getRepository(AccountGroup)
const categoryRepository = db.getRepository(AccountingCategory)
const userRepository = db.getRepository(NonAdminUser)
const accountRepository = db.getRepository(MasterAccount)
const txnRepository = db.getRepository(Transaction)
const txnLineRepository = db.getRepository(TransactionLine)

router.post('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  const date = req.body.date
  const description = req.body.description

  if (description === undefined || date === undefined) {
    res.sendStatus(400)
    return
  }

  const txnDate = new Date(date)
  if (!txnDate) {
    res.sendStatus(400)
    return
  }

  const txn = new Transaction()
  txn.date = format(txnDate, 'yyyy/MM/dd')
  txn.description = description
  txn.userID = userId
  await txnRepository.save(txn)

  const updated = await txnRepository.findOneBy({ ID: txn.ID }) // Fix date
  if (!updated) {
    res.sendStatus(404)
    return
  }
  res.json(instanceToPlain(updated))
})

router.get('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }

  const userId = req.session.profile.ID

  const txns = (
    await txnRepository.find({
      where: {
        userID: userId,
      },
    })
  ).map((txn) => instanceToPlain(txn))

  res.json(txns)
})

router.put('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }
  const txnId = parseInt(req.params.id, 10)

  if (!userId || isNaN(txnId)) {
    res.sendStatus(400)
    return
  }

  const txn = await txnRepository.findOne({
    where: { ID: txnId },
  })

  if (!txn) {
    res.sendStatus(404)
    return
  }

  if (txn.userID !== userId) {
    res.sendStatus(403)
    return
  }

  const { description, date } = req.body

  if (description === undefined || typeof description !== 'string') {
    res.sendStatus(400)
    return
  }

  const txnDate = new Date(date)
  if (!txnDate) {
    res.sendStatus(400)
    return
  }

  txn.description = description
  txn.date = format(txnDate, 'yyyy/MM/dd')

  await txnRepository.save(txn)

  const updated = await txnRepository.findOneBy({ ID: txnId }) // Fix date
  if (!updated) {
    res.sendStatus(404)
    return
  }
  res.json(instanceToPlain(updated))
})

router.delete('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }
  const txnId = parseInt(req.params.id, 10)

  if (isNaN(txnId)) {
    res.sendStatus(400)
    return
  }

  const txn = await txnRepository.findOne({
    where: { ID: txnId },
  })

  if (!txn) {
    res.sendStatus(404)
    return
  }

  if (txn.userID !== userId) {
    res.sendStatus(403)
    return
  }

  await txnRepository.delete(txnId)

  const promises = []
  for (const line of txn.lines) {
    promises.push(recalculateClosingAmount(line.accountID))
  }
  await Promise.all(promises)
  res.sendStatus(200)
})

// Create a transaction line
router.post('/id/:id/lines', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }

  const transactionID = parseInt(req.params.id, 10)
  const { accountID, amount, comment, type } = req.body

  if (!transactionID || !accountID || !amount || !type) {
    res.sendStatus(400)
    return
  }

  const txn = await txnRepository.findOne({ where: { ID: transactionID } })
  const account = await accountRepository.findOne({
    where: { ID: accountID },
    relations: ['group', 'group.user'],
  })

  if (!txn || !account) {
    res.sendStatus(400)
    return
  }
  if (txn.userID !== userId || account.group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  const line = new TransactionLine()
  line.transactionID = transactionID
  line.accountID = accountID
  line.amount = amount
  line.comment = comment
  line.type = type

  await txnLineRepository.save(line)
  await recalculateClosingAmount(line.accountID)
  res.json(line)
})

// Get a transaction and all of its lines
router.get('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }

  const txnId = parseInt(req.params.id, 10)
  if (isNaN(txnId)) {
    res.sendStatus(400)
    return
  }

  const txn = await txnRepository.findOne({
    where: { ID: txnId },
    relations: ['lines', 'lines.account'],
  })
  if (!txn || txn.userID !== userId) {
    res.sendStatus(403)
    return
  }

  res.json(instanceToPlain(txn))
})

// Update a line
router.put('/lines/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }

  const lineId = parseInt(req.params.id, 10)
  if (isNaN(lineId)) {
    res.sendStatus(400)
    return
  }

  const line = await txnLineRepository.findOne({
    where: { ID: lineId },
    relations: ['transaction'],
  })

  if (!line || line.transaction.userID !== userId) {
    res.sendStatus(403)
    return
  }

  const { accountID, amount, comment, type } = req.body

  if (amount !== undefined && !isNaN(line.amount)) line.amount = amount
  if (comment !== undefined) line.comment = comment
  if (
    type !== undefined &&
    (type === EEntryType.CREDIT || type === EEntryType.DEBIT)
  ) {
    line.type = type
  }
  const oldAccount = line.accountID
  if (accountID !== undefined && accountID !== oldAccount) {
    line.accountID = accountID
  }

  await txnLineRepository.save(line)
  await recalculateClosingAmount(oldAccount)
  res.json(line)
})

// Delete a line
router.delete('/lines/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }

  const lineId = parseInt(req.params.id, 10)
  if (isNaN(lineId)) {
    res.sendStatus(400)
    return
  }

  const line = await txnLineRepository.findOne({
    where: { ID: lineId },
    relations: ['transaction'],
  })

  if (!line || line.transaction.userID !== userId) {
    res.sendStatus(403)
    return
  }

  await txnLineRepository.delete(lineId)
  await recalculateClosingAmount(line.accountID)
  res.sendStatus(200)
})

export default router
