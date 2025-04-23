import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { MasterAccount } from '../entity/MasterAccount.js'

const router = express.Router()

const groupRepository = db.getRepository(AccountGroup)
const accountRepository = db.getRepository(MasterAccount)

// Create a master account
router.post('/', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  // Get details from body
  const name = req.body.name
  const openingAmount = req.body.openingAmount
  const groupID = req.body.groupID

  // Validate details
  if (!name || name.length > 256 || openingAmount === undefined || !groupID) {
    res.sendStatus(400)
    return
  }

  // Find group with the correct ID
  const group = await groupRepository.findOne({
    where: { ID: groupID },
    relations: ['user'],
  })
  if (!group) {
    res.sendStatus(400)
    return
  }

  // Ensure group belongs to user
  if (group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  // Create account with the correct group
  const act = new MasterAccount()
  act.group = group
  act.groupID = group.ID
  act.openingAmount = openingAmount
  act.closingAmount = openingAmount
  act.name = name
  // Save account in database
  await accountRepository.save(act)

  res.json(act)
})

// Get all accounts for the user
router.get('/', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }

  const userId = req.session.profile.ID

  // Find accounts in database
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

// Update account by ID
router.put('/id/:id', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  const userId = req.session.profile?.ID
  if (!userId) {
    res.sendStatus(401)
    return
  }
  // Parse account ID from path
  const accountId = parseInt(req.params.id, 10)
  if (isNaN(accountId)) {
    res.sendStatus(400)
    return
  }

  // Find account in database
  const account = await accountRepository.findOne({
    where: { ID: accountId },
    relations: ['group', 'group.user'],
  })
  if (!account) {
    res.sendStatus(404)
    return
  }

  // Ensure account is in a group owned by the user
  if (account.group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  // Get details from body
  const { name, groupID, openingAmount } = req.body

  // Validate name
  if (!name || typeof name !== 'string' || name.length > 256) {
    res.sendStatus(400)
    return
  }

  // Validate opening amount
  if (isNaN(Number.parseFloat(openingAmount))) {
    res.sendStatus(400)
    return
  }

  // Find group in database
  const group = await groupRepository.findOne({
    where: { ID: groupID },
    relations: ['user'],
  })
  if (!group) {
    res.sendStatus(404)
    return
  }

  // Ensure user owns new group
  if (group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  // Update entity
  account.group = group
  account.name = name
  account.closingAmount += openingAmount - account.openingAmount // Update closing amount
  account.openingAmount = openingAmount

  // Save entity in database
  await accountRepository.save(account)

  res.json(account)
})

// Delete account by ID
router.delete('/id/:id', withUserAuth, async (req, res) => {
  const userId = req.session.profile?.ID
  // Ensure user is authenitcated
  if (!userId) {
    res.sendStatus(401)
    return
  }
  // Parse account ID from path
  const accountId = parseInt(req.params.id, 10)
  if (isNaN(accountId)) {
    res.sendStatus(400)
    return
  }

  // Find account in database
  const account = await accountRepository.findOne({
    where: { ID: accountId },
    relations: ['group', 'group.user'],
  })
  if (!account) {
    res.sendStatus(404)
    return
  }

  // Ensure account's group is owned by the user
  if (account.group.user.ID !== userId) {
    res.sendStatus(403)
    return
  }

  // Delete the account entity
  await accountRepository.delete(accountId)

  res.sendStatus(200)
})

export default router
