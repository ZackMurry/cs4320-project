import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { AccountingCategory } from '../entity/AccountingCategory.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'

const router = express.Router()

// Load repositories for relevant tables
const groupRepository = db.getRepository(AccountGroup)
const categoryRepository = db.getRepository(AccountingCategory)
const userRepository = db.getRepository(NonAdminUser)

// Get all groups
router.get('/', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  // Get top-level categories
  const categories = await categoryRepository.find()
  if (!categories) {
    console.error('Could not find any categories!')
    res.sendStatus(500)
    return
  }
  // Get the user's groups
  const groups = await groupRepository.find({
    where: { user: { ID: userId } },
  })
  res.json({ categories, groups })
})

// Create a group
router.post('/', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  // Get details from body
  const name = req.body.name
  const category = req.body.category
  const parent = req.body.parent

  // Validate name
  if (!name || name.length > 256) {
    res.sendStatus(400)
    return
  }

  // Find user entity in database
  const owner = await userRepository.findOneBy({ ID: userId })
  if (!owner) {
    res.sendStatus(401)
    return
  }

  // If the parent group is specified, find the parentGroup
  let parentGroup = null
  if (parent) {
    parentGroup = await groupRepository.findOne({
      where: { ID: parent },
      relations: ['category'],
    })
    if (!parentGroup) {
      res.sendStatus(400)
      return
    }
  }

  // Validate category ID
  let cat = null
  if (!parentGroup) {
    console.log('Using category for group', category)
    if (!category) {
      res.sendStatus(400)
      return
    }
    cat = await categoryRepository.findOne({
      where: { ID: category },
    })
    // One of category and parent need to exist
    if (!cat) {
      res.sendStatus(400)
      return
    }
  }

  // Create group entity
  const ag = new AccountGroup()
  ag.category = cat ?? parentGroup!.category
  ag.user = owner
  ag.name = name
  ag.parent = parentGroup
  // Save entity in database
  await groupRepository.save(ag)

  res.json(ag)
})

// Delete group by ID
router.delete('/id/:id', withUserAuth, async (req, res) => {
  // Ensure user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  // Parse group ID from path
  const id = Number.parseInt(req.params.id)
  if (!id) {
    res.sendStatus(400)
    return
  }
  // Ensure the group exists and is owned by the user
  const exists = await groupRepository.existsBy({
    ID: id,
    user: { ID: userId },
  })
  if (!exists) {
    res.sendStatus(404)
    return
  }
  //  Delete the group in the database
  await groupRepository.delete(id)
  res.sendStatus(200)
})

// Update the group with the given ID
router.put('/id/:id', withUserAuth, async (req, res) => {
  // Ensure the user is authenticated
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  // Parse group ID from path
  const id = Number.parseInt(req.params.id)
  if (!id) {
    res.sendStatus(400)
    return
  }
  // Find group by ID owned by user
  const group = await groupRepository.findOneBy({
    ID: id,
    user: { ID: userId },
  })
  if (!group) {
    res.sendStatus(404)
    return
  }

  // Get name from body and validate it
  const name = req.body.name
  if (!name || name.length > 256) {
    res.sendStatus(400)
    return
  }
  group.name = name
  // Save the group in the database
  await groupRepository.save(group)
  res.sendStatus(200)
})

export default router
