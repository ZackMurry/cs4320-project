import express from 'express'
import db from '../data-source.js'
import { UserPassword } from '../entity/UserPassword.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import * as bcrypt from 'bcrypt'
import { EUserType, iFINANCEUser } from '../entity/iFINANCEUser.js'
import withAuth from '../middleware/withAuth.js'
import { Administrator } from '../entity/Administrator.js'

const router = express.Router()

const userRepository = db.getRepository(iFINANCEUser)
const passwordRepository = db.getRepository(UserPassword)
const nonAdminRepostitory = db.getRepository(NonAdminUser)
const adminRepository = db.getRepository(Administrator)

const bcryptSaltRounds = 10

router.post('/', async (req, res) => {
  if (req.session.profile?.username !== 'admin') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminID = req.session.profile?.ID
  if (adminID === undefined || adminID === null) {
    res.sendStatus(403)
    return
  }
  console.log(req.body)
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
  user.email = email
  user.password = new UserPassword()

  const admin = await adminRepository.findOneBy({ ID: adminID })
  if (!admin) {
    res.sendStatus(403)
    return
  }
  user.administrator = admin

  user.type = EUserType.USER
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
  res.sendStatus(200)
})

router.get('/', withAuth, async (req, res) => {
  console.log(req.session.profile)
  if (req.session.profile?.username !== 'admin') {
    // todo: allow changing admin name and multiple admins
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminID = req.session.profile?.ID
  if (adminID === undefined || adminID === null) {
    res.sendStatus(403)
    return
  }
  console.log('adminID', adminID)
  const users = await nonAdminRepostitory.find({
    where: { administrator: { ID: adminID } },
  })
  res.json(users)
})

router.post('/login', async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (username === 'admin' && password === 'admin') {
    // Temp login code
    let passwordEntity = await passwordRepository.findOne({
      where: {
        userName: username,
      },
    })
    if (!passwordEntity) {
      // Create new admin if none exist
      const numAdmins = await adminRepository.count({
        where: { type: EUserType.ADMIN },
      })
      console.log('num admins', numAdmins)
      if (numAdmins > 0) {
        res.sendStatus(400)
        return
      }
      let adminEntity = new Administrator()
      adminEntity.dateHired = new Date().toDateString()
      adminEntity.dateFinished = null
      adminEntity.name = 'Administrator'
      adminEntity.type = EUserType.ADMIN
      adminEntity = await adminRepository.save(adminEntity)

      let pass = new UserPassword()
      pass.encryptedPassword = await bcrypt.hash(password, bcryptSaltRounds)
      pass.userName = username
      pass = await passwordRepository.save(pass)

      adminEntity.password = pass
      await adminRepository.save(adminEntity)
    }
    const adminEntity = await adminRepository.findOne({
      where: {
        password: {
          userName: username,
        },
      },
      relations: ['password'],
    })
    if (!adminEntity || !adminEntity.password) {
      res.sendStatus(400)
      return
    }
    const matches = await bcrypt.compare(
      password,
      adminEntity.password.encryptedPassword,
    )
    console.log('matches', matches)
    if (!matches) {
      res.sendStatus(400)
      return
    }
    req.session.profile = {
      ID: adminEntity.ID,
      username: adminEntity.password.userName,
      role: adminEntity.type,
    }
    res.redirect('/admin')
    return
  }
  const passEntity = await passwordRepository.findOneBy({ userName: username })
  console.log(passEntity)
  if (!passEntity) {
    res.sendStatus(400)
    return
  }
  let userID = (
    await adminRepository.findOneBy({
      password: { ID: passEntity.ID },
    })
  )?.ID
  if (!userID) {
    userID = (
      await userRepository.findOneBy({
        password: { ID: passEntity.ID },
      })
    )?.ID
  }
  if (!userID) {
    res.sendStatus(400)
    return
  }

  console.log(userID)
  res.sendStatus(400)
})

router.get('/me', withAuth, async (req, res) => {
  console.log('GET /api/v1/users/me')
  console.log(req.session.profile)
  const username = req.session.profile?.username
  if (!username) {
    res.status(500).send()
    return
  }
  res.json({ username })
})

router.delete('/id/:id', withAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id)
  if (req.session.profile?.role !== 'ADMIN') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminId = req.session.profile.ID
  const u = await nonAdminRepostitory.findOne({
    where: { ID: id },
    relations: ['administrator'],
  })
  if (!u || u.administrator.ID !== adminId) {
    res.sendStatus(403)
    return
  }
  await nonAdminRepostitory.delete(id)

  res.sendStatus(200)
})

export default router
