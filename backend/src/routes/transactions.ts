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

// Load database repositories
const accountRepository = db.getRepository(MasterAccount)
const txnRepository = db.getRepository(Transaction)
const txnLineRepository = db.getRepository(TransactionLine)

// Route to create new transaction
router.post('/', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  // Get details from body
  const date = req.body.date
  const description = req.body.description

  // Validate details
  if (description === undefined || date === undefined) {
    res.sendStatus(400)
    return
  }

  // Convert date string into date
  const txnDate = new Date(date)
  if (!txnDate) {
    res.sendStatus(400)
    return
  }

  // Create transaction entity
  const txn = new Transaction()
  txn.date = format(txnDate, 'yyyy/MM/dd')
  txn.description = description
  txn.userID = userId
  // Save transaction to database
  await txnRepository.save(txn)

  // Retrieve from database to get the transaction in standard format
  const updated = await txnRepository.findOneBy({ ID: txn.ID })
  if (!updated) {
    res.sendStatus(404)
    return
  }
  // Use instanceToPlain to get computed properties
  res.json(instanceToPlain(updated))
})

// Get all transactions associated with the user
router.get('/', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }

  const userId = req.session.profile.ID

  // Find transactions and their computed fields
  const txns = (
    await txnRepository.find({
      where: {
        userID: userId,
      },
    })
  ).map((txn) => instanceToPlain(txn))

  res.json(txns)
})

// Update a transaction
router.put('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenticated
  if (!userId) {
    res.sendStatus(401)
    return
  }
  // Get transaction id from request path (:id)
  const txnId = parseInt(req.params.id, 10)

  // Validate transactionId
  if (!userId || isNaN(txnId)) {
    res.sendStatus(400)
    return
  }

  // Find transaction in database
  const txn = await txnRepository.findOne({
    where: { ID: txnId },
  })

  // If not found
  if (!txn) {
    res.sendStatus(404)
    return
  }

  // If not owned by the user
  if (txn.userID !== userId) {
    res.sendStatus(403)
    return
  }

  // Get new details from body
  const { description, date } = req.body

  // Validate decsription
  if (description === undefined || typeof description !== 'string') {
    res.sendStatus(400)
    return
  }

  // Validate date
  const txnDate = new Date(date)
  if (!txnDate) {
    res.sendStatus(400)
    return
  }

  txn.description = description
  // Format date
  txn.date = format(txnDate, 'yyyy/MM/dd')

  // Save in database
  await txnRepository.save(txn)

  // Retrieve from database to get the transaction in standard format
  const updated = await txnRepository.findOneBy({ ID: txnId }) // Fix date
  if (!updated) {
    res.sendStatus(404)
    return
  }
  // Use instanceToPlain to include computed properties
  res.json(instanceToPlain(updated))
})

// Delete transaction by ID
router.delete('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenticated
  if (!userId) {
    res.sendStatus(401)
    return
  }
  // Parse transaction ID from path
  const txnId = parseInt(req.params.id, 10)

  // Validate transaction ID
  if (isNaN(txnId)) {
    res.sendStatus(400)
    return
  }

  // Find transaction in database
  const txn = await txnRepository.findOne({
    where: { ID: txnId },
  })

  // If not found
  if (!txn) {
    res.sendStatus(404)
    return
  }

  // If not owned by user
  if (txn.userID !== userId) {
    res.sendStatus(403)
    return
  }

  // Delete it
  await txnRepository.delete(txnId)

  // Recalculate closing amounts of all involved accounts
  const promises = []
  for (const line of txn.lines) {
    promises.push(recalculateClosingAmount(line.accountID))
  }
  // Await all promises
  await Promise.all(promises)
  res.sendStatus(200)
})

// Create a transaction line
router.post('/id/:id/lines', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenticated
  if (!userId) {
    res.sendStatus(401)
    return
  }

  // Parse transaction ID from path
  const transactionID = parseInt(req.params.id, 10)
  // Get details from body
  const { accountID, amount, comment, type } = req.body

  // Ensure all details are present
  if (!transactionID || !accountID || !amount || !type) {
    res.sendStatus(400)
    return
  }

  // Find transaction
  const txn = await txnRepository.findOne({ where: { ID: transactionID } })
  // Find account
  const account = await accountRepository.findOne({
    where: { ID: accountID },
    relations: ['group', 'group.user'],
  })

  // Make sure both transaction and account were found
  if (!txn || !account) {
    res.sendStatus(400)
    return
  }
  // Ensure user owns these entities
  if (txn.userID !== userId || account.group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  // Create transaction line entity
  const line = new TransactionLine()
  line.transactionID = transactionID
  line.accountID = accountID
  line.amount = amount
  line.comment = comment
  line.type = type

  // Save live in database
  await txnLineRepository.save(line)
  // Recalculate closing amount for account
  await recalculateClosingAmount(line.accountID)
  res.json(line)
})

// Get a transaction and all of its lines
router.get('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenticated
  if (!userId) {
    res.sendStatus(401)
    return
  }

  // Parse transaction ID from the path
  const txnId = parseInt(req.params.id, 10)
  // Validate it
  if (isNaN(txnId)) {
    res.sendStatus(400)
    return
  }

  // Find the transaction in the database
  const txn = await txnRepository.findOne({
    where: { ID: txnId },
    relations: ['lines', 'lines.account'],
  })
  // Ensure it is found and the user has access
  if (!txn || txn.userID !== userId) {
    res.sendStatus(403)
    return
  }

  // Return transaction with calculated fields
  res.json(instanceToPlain(txn))
})

// Update a line
router.put('/lines/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenticated
  if (!userId) {
    res.sendStatus(401)
    return
  }

  // Parse lineId from path
  const lineId = parseInt(req.params.id, 10)
  if (isNaN(lineId)) {
    res.sendStatus(400)
    return
  }

  // Find line in database
  const line = await txnLineRepository.findOne({
    where: { ID: lineId },
    relations: ['transaction'],
  })

  // If line doesn't exist or is not owned by the user
  if (!line || line.transaction.userID !== userId) {
    res.sendStatus(400)
    return
  }

  // Get details from body
  const { accountID, amount, comment, type } = req.body

  // Validate all fields and update the entity
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

  // Update line in database
  await txnLineRepository.save(line)
  // Recalculate closing amount for the old account
  await recalculateClosingAmount(oldAccount)
  // Recalculate closing amount for the new account
  await recalculateClosingAmount(accountID)
  res.json(line)
})

// Delete a transaction line
router.delete('/lines/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenticated
  if (!userId) {
    res.sendStatus(401)
    return
  }

  // Parse lineId from path
  const lineId = parseInt(req.params.id, 10)
  if (isNaN(lineId)) {
    res.sendStatus(400)
    return
  }

  // Get line from database
  const line = await txnLineRepository.findOne({
    where: { ID: lineId },
    relations: ['transaction'],
  })

  // Ensure line exists and it is owned by the user
  if (!line || line.transaction.userID !== userId) {
    res.sendStatus(403)
    return
  }

  // Delete the line
  await txnLineRepository.delete(lineId)
  // Update closing amount for the involved account
  await recalculateClosingAmount(line.accountID)
  res.sendStatus(200)
})

export default router
