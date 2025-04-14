import express from 'express'
import withUserAuth from '../middleware/withUserAuth.js'
import db from '../data-source.js'
import { AccountGroup } from '../entity/AccountGroup.js'
import { AccountingCategory } from '../entity/AccountingCategory.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'

const router = express.Router()

const groupRepository = db.getRepository(AccountGroup)
const categoryRepository = db.getRepository(AccountingCategory)
const userRepository = db.getRepository(NonAdminUser)

router.get('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  const categories = await categoryRepository.find()
  if (!categories) {
    console.error('Could not find any categories!')
    res.sendStatus(500)
    return
  }
  const groups = await groupRepository.find({
    where: { user: { ID: userId } },
  })
  res.json({ categories, groups })
})

router.post('/', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  const name = req.body.name
  const category = req.body.category
  const parent = req.body.parent
  console.log(req.body)

  if (!name || name.length > 256) {
    res.sendStatus(400)
    return
  }

  const owner = await userRepository.findOneBy({ ID: userId })
  if (!owner) {
    res.sendStatus(401)
    return
  }

  let parentGroup = null
  if (parent) {
    console.log('Using parent for group', parent)
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

  const ag = new AccountGroup()
  ag.category = cat ?? parentGroup!.category
  ag.user = owner
  ag.name = name
  ag.parent = parentGroup
  await groupRepository.save(ag)

  res.json(ag)
})

router.delete('/id/:id', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  const id = Number.parseInt(req.params.id)
  if (!id) {
    res.sendStatus(400)
    return
  }
  const exists = await groupRepository.existsBy({
    ID: id,
    user: { ID: userId },
  })
  if (!exists) {
    res.sendStatus(404)
    return
  }
  await groupRepository.delete(id)
  res.sendStatus(200)
})

router.put('/id/:id', withUserAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const userId = req.session.profile.ID
  const id = Number.parseInt(req.params.id)
  if (!id) {
    res.sendStatus(400)
    return
  }
  const group = await groupRepository.findOneBy({
    ID: id,
    user: { ID: userId },
  })
  if (!group) {
    res.sendStatus(404)
    return
  }

  const name = req.body.name
  if (!name || name.length > 256) {
    res.sendStatus(400)
    return
  }
  group.name = name
  await groupRepository.save(group)
  res.sendStatus(200)
})

export default router
