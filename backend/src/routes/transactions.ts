import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { AccountingCategory } from '../entity/AccountingCategory.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import { MasterAccount } from '../entity/MasterAccount.js'
import { Transaction } from '../entity/Transaction.js'

const router = express.Router()

const groupRepository = db.getRepository(AccountGroup)
const categoryRepository = db.getRepository(AccountingCategory)
const userRepository = db.getRepository(NonAdminUser)
const accountRepository = db.getRepository(MasterAccount)
const txnRepository = db.getRepository(Transaction)

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

export default router
