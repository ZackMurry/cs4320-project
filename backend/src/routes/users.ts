import express from 'express'
import db from '../data-source.js'
import { UserPassword } from '../entity/UserPassword.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import * as bcrypt from 'bcrypt'
import { iFINANCEUser } from '../entity/iFINANCEUser.js'

const router = express.Router()

const userRepository = db.getRepository(iFINANCEUser)
const passwordRepository = db.getRepository(UserPassword)

const bcryptSaltRounds = 10

router.post('/api/v1/users', async (req, res) => {
  if (req.session.profile?.username !== 'admin') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const username = req.body.username
  const password = req.body.password
  const name = req.body.name
  const address = req.body.address
  const email = req.body.email

  if (!username || username.length < 3 || username.length > 24) {
    res.sendStatus(400)
    return
  }
  if (!password || password.length < 5 || password.length > 24) {
    res.sendStatus(400)
    return
  }
  const user = new NonAdminUser()
  user.name = name
  user.address = address
  user.email = user.email
  user.password = new UserPassword()
  user.password.encryptedPassword = await bcrypt.hash(
    password,
    bcryptSaltRounds,
  )
  user.password.userName = username
  const passwordExpiryDate = new Date()
  passwordExpiryDate.setMonth(passwordExpiryDate.getMonth() + 6)
  user.password.passwordExpiryTime = 60 * 60 * 24 * 7 // Require new signin after 1 week
  const accountExpiryDate = new Date()
  accountExpiryDate.setFullYear(accountExpiryDate.getFullYear() + 10)
  user.password.userAccountExpiryDate = accountExpiryDate // Expire in 10 years
  await userRepository.save(user)
})

router.post('/api/v1/login', async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (username === 'admin' && password === 'admin') {
    // Temp login code
    req.session.profile = { ID: 0, username: 'admin' }
    res.sendStatus(200)
  } else {
    res.sendStatus(400)
  }
})

router.get('/me', withAuth, async (req, res) => {
  console.log('GET /api/v1/users/me')
  console.log(req.session.profile)
  const email = req.session.profile?.email
  if (!email) {
    res.status(500).send()
    return
  }
  res.json({ email })
})

export default router
