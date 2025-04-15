import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { AccountingCategory } from '../entity/AccountingCategory.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import { MasterAccount } from '../entity/MasterAccount.js'
import { Transaction } from '../entity/Transaction.js'
import { EEntryType, TransactionLine } from '../entity/TransactionLine.js'

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
  txn.date = txnDate
  txn.description = description
  txn.userID = userId
  await txnRepository.save(txn)

  res.json(txn)
})

router.get('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }

  const userId = req.session.profile.ID

  const txns = await txnRepository.find({
    where: {
      userID: userId,
    },
  })

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
    relations: ['group', 'group.user'],
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
  txn.date = txnDate

  await txnRepository.save(txn)

  res.json(txn)
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

  res.json(txn)
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

  const { amount, comment, type } = req.body

  if (amount !== undefined && !isNaN(line.amount)) line.amount = amount
  if (comment !== undefined) line.comment = comment
  if (
    type !== undefined &&
    (type === EEntryType.CREDIT || type === EEntryType.DEBIT)
  ) {
    line.type = type
  }

  await txnLineRepository.save(line)
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
  res.sendStatus(200)
})

export default router
