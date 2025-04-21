import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { AccountingCategory } from '../entity/AccountingCategory.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import { MasterAccount } from '../entity/MasterAccount.js'

const router = express.Router()

const groupRepository = db.getRepository(AccountGroup)
const categoryRepository = db.getRepository(AccountingCategory)
const userRepository = db.getRepository(NonAdminUser)
const accountRepository = db.getRepository(MasterAccount)

router.post('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  const name = req.body.name
  const openingAmount = req.body.openingAmount
  const groupID = req.body.groupID

  if (!name || name.length > 256 || openingAmount === undefined || !groupID) {
    res.sendStatus(400)
    return
  }

  const group = await groupRepository.findOne({
    where: { ID: groupID },
    relations: ['user'],
  })
  if (!group) {
    res.sendStatus(400)
    return
  }

  if (group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  const act = new MasterAccount()
  act.group = group
  act.groupID = group.ID
  act.openingAmount = openingAmount
  act.closingAmount = openingAmount
  act.name = name
  await accountRepository.save(act)

  res.json(act)
})

router.get('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }

  const userId = req.session.profile.ID

  const accounts = await accountRepository.find({
    relations: ['group', 'group.user', 'group.category'],
    where: {
      group: {
        user: {
          ID: userId,
        },
      },
    },
  })

  res.json(accounts)
})

router.put('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }
  const accountId = parseInt(req.params.id, 10)

  if (!userId || isNaN(accountId)) {
    res.sendStatus(400)
    return
  }

  const account = await accountRepository.findOne({
    where: { ID: accountId },
    relations: ['group', 'group.user'],
  })

  if (!account) {
    res.sendStatus(404)
    return
  }

  if (account.group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  const { name, groupID, openingAmount } = req.body

  if (!name || typeof name !== 'string' || name.length > 256) {
    res.sendStatus(400)
    return
  }

  if (isNaN(Number.parseFloat(openingAmount))) {
    res.sendStatus(400)
    return
  }

  const group = await groupRepository.findOne({
    where: { ID: groupID },
    relations: ['user'],
  })

  if (!group) {
    res.sendStatus(404)
    return
  }

  if (group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  account.group = group
  account.name = name
  account.closingAmount += openingAmount - account.openingAmount // Update closing amount
  account.openingAmount = openingAmount

  await accountRepository.save(account)

  res.json(account)
})

router.delete('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }
  const accountId = parseInt(req.params.id, 10)

  if (!userId || isNaN(accountId)) {
    res.sendStatus(400)
    return
  }

  const account = await accountRepository.findOne({
    where: { ID: accountId },
    relations: ['group', 'group.user'],
  })

  if (!account) {
    res.sendStatus(404)
    return
  }

  if (account.group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  await accountRepository.delete(accountId)

  res.sendStatus(200)
})

export default router
