import express from 'express'
import db from '../data-source.js'
import { UserPassword } from '../entity/UserPassword.js'
import { NonAdminUser } from '../entity/NonAdminUser.js'
import * as bcrypt from 'bcrypt'
import { EUserType, iFINANCEUser } from '../entity/iFINANCEUser.js'
import withAuth from '../middleware/withAuth.js'
import { Administrator } from '../entity/Administrator.js'
import { AdminUpdateRequest, NonAdminProfile } from '../types/types.js'

const router = express.Router()

// Load repoistories
const userRepository = db.getRepository(iFINANCEUser)
const passwordRepository = db.getRepository(UserPassword)
const nonAdminRepository = db.getRepository(NonAdminUser)
const adminRepository = db.getRepository(Administrator)

const bcryptSaltRounds = 10

// Create new users
router.post('/', async (req, res) => {
  if (req.session.profile?.role !== 'ADMIN') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminID = req.session.profile?.ID
  if (adminID === undefined || adminID === null) {
    res.sendStatus(403)
    return
  }
  // Get details from body
  const username = req.body.username
  const password = req.body.password
  const name = req.body.name
  const address = req.body.address
  const email = req.body.email

  // Validate username
  if (!username || username.length < 3 || username.length > 24) {
    res.sendStatus(400)
    return
  }
  // Validate password
  if (!password || password.length < 5 || password.length > 24) {
    res.sendStatus(400)
    return
  }
  // Create NonAdminUser entity
  const user = new NonAdminUser()
  user.name = name
  user.address = address
  user.email = email
  user.password = new UserPassword() // Attach UserPassword entity

  // Set user.admin to the current user
  const admin = await adminRepository.findOneBy({ ID: adminID })
  if (!admin) {
    res.sendStatus(403)
    return
  }
  user.administrator = admin

  user.type = EUserType.USER
  // Set user password details
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
  await userRepository.save(user) // Save user in database
  res.sendStatus(200)
})

// Get users managed by the current (admin) user
router.get('/', withAuth, async (req, res) => {
  if (req.session.profile?.role !== EUserType.ADMIN) {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminID = req.session.profile?.ID
  if (adminID === undefined || adminID === null) {
    res.sendStatus(403)
    return
  }
  // Get users from database
  const users = await nonAdminRepository
    .createQueryBuilder('user')
    .leftJoin('user.password', 'password')
    .addSelect(['password.userName']) // select only the userName from the password relation
    .where('user.administrator = :adminID', { adminID })
    .getMany()
  if (!users) {
    res.json([])
    return
  }
  // Hide password from admin (besides the userName attribute)
  const flatUsers = users.map((user) => ({
    ...user,
    userName: user.password?.userName,
    password: undefined,
  }))
  res.json(flatUsers)
})

// Login route
router.post('/login', async (req, res) => {
  // Get data from body
  const username = req.body.username
  const password = req.body.password

  // If the default admin credentials are used
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
      // Create default admin entity
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
  // Find the user's password
  const passEntity = await passwordRepository.findOneBy({ userName: username })
  if (!passEntity) {
    res.sendStatus(400)
    return
  }
  // Is this an admin or non-admin user?
  let userID = (
    await adminRepository.findOneBy({
      password: { ID: passEntity.ID },
    })
  )?.ID
  let role = EUserType.ADMIN
  if (!userID) {
    // Non-admin
    userID = (
      await nonAdminRepository.findOneBy({
        password: { ID: passEntity.ID },
      })
    )?.ID
    role = EUserType.USER
  }
  if (!userID) {
    res.sendStatus(400)
    return
  }

  // Check password
  const matches = await bcrypt.compare(password, passEntity.encryptedPassword)
  if (!matches) {
    res.sendStatus(400)
    return
  }
  // Update session
  req.session.profile = {
    ID: userID,
    username: passEntity.userName,
    role: role,
  }
  // Redirect to appropriate home page
  if (role === EUserType.ADMIN) {
    res.redirect('/admin')
  } else {
    res.redirect('/home')
  }
})

// Logout route
router.get('/logout', withAuth, async (req, res) => {
  req.session.destroy((err) => {})
  res.redirect('/')
})

// Get current user information
router.get('/me', withAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const { role, ID, username } = req.session.profile
  if (role === 'ADMIN') {
    // Get admin information
    const admin = await adminRepository.findOneBy({ ID })
    if (!admin) {
      res.sendStatus(500)
      return
    }
    res.json({
      role,
      ID,
      userName: username,
      name: admin.name,
    })
  } else {
    // Get user information
    const user = await nonAdminRepository.findOneBy({ ID })
    if (!user) {
      res.sendStatus(500)
      return
    }
    res.json({
      role,
      ID,
      userName: username,
      name: user.name,
    })
  }
})

// Delete a user by ID (done by admin user)
router.delete('/id/:id', withAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id)
  if (req.session.profile?.role !== 'ADMIN') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminId = req.session.profile.ID
  // Find user in database
  const u = await nonAdminRepository.findOne({
    where: { ID: id },
    relations: ['administrator'],
  })
  // Validate authority
  if (!u || u.administrator.ID !== adminId) {
    res.sendStatus(403)
    return
  }
  // Delete user in database
  await nonAdminRepository.delete(id)

  res.sendStatus(200)
})

// Get a user by ID (done by admin)
router.get('/id/:id', withAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id)
  if (req.session.profile?.role !== 'ADMIN') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminId = req.session.profile.ID
  // Find user in database
  const u = await nonAdminRepository.findOne({
    where: { ID: id },
    relations: ['administrator', 'password'],
  })
  // Make sure the admin is authorized for this user
  if (!u || u.administrator.ID !== adminId) {
    res.sendStatus(403)
    return
  }

  // Return all but encrypted password
  res.json({ ...u, password: { ...u.password, encryptedPassword: undefined } })
})

// Update current user information
router.put('/me', withAuth, async (req, res) => {
  if (!req.session.profile) {
    res.sendStatus(401)
    return
  }
  const { role, ID } = req.session.profile
  if (role === 'ADMIN') {
    // Update admin user information
    const admin = await adminRepository.findOne({
      where: { ID },
      relations: ['password'],
    })
    if (!admin || !admin.password) {
      res.sendStatus(500)
      return
    }
    const { userName, password, name } = req.body as AdminUpdateRequest
    if (password) {
      if (password.length < 5 || password.length > 24) {
        res.sendStatus(400)
        return
      }
      admin.password.encryptedPassword = await bcrypt.hash(
        password,
        bcryptSaltRounds,
      )
    }
    if (userName !== admin.password.userName) {
      // If name is changing
      let sameName = await adminRepository.count({
        where: { password: { userName: userName } },
        relations: ['password'],
      })
      sameName += await nonAdminRepository.count({
        where: { password: { userName: userName } },
        relations: ['password'],
      })
      if (sameName > 0) {
        res.sendStatus(409) // Conflict
        return
      }
    }
    admin.name = name
    admin.password.userName = userName
    await adminRepository.save(admin)
    res.sendStatus(200)
  } else {
    // Users can only change their password
    const password = req.body.password
    if (!password || password.length < 5 || password.length > 24) {
      res.sendStatus(400)
      return
    }
    const user = await nonAdminRepository.findOne({
      where: { ID },
      relations: ['password'],
    })
    if (!user || !user.password) {
      res.sendStatus(401)
      return
    }
    user.password.encryptedPassword = await bcrypt.hash(
      password,
      bcryptSaltRounds,
    )
    await nonAdminRepository.save(user)
    res.sendStatus(200)
  }
})

// Update user information (done by admin)
router.put('/id/:id', withAuth, async (req, res) => {
  const id = Number.parseInt(req.params.id)
  if (req.session.profile?.role !== 'ADMIN') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminId = req.session.profile.ID
  const u = await nonAdminRepository.findOne({
    where: { ID: id },
    relations: ['administrator', 'password'],
  })
  if (!u || u.administrator.ID !== adminId) {
    res.sendStatus(403)
    return
  }
  if (!u.password) {
    res.sendStatus(500)
    return
  }
  const { userName, password, email, address, name } =
    req.body as NonAdminProfile
  if (!userName || !name) {
    res.sendStatus(400)
    return
  }

  // The password is not required if it is not being changed
  if (password) {
    if (password.length < 5 || password.length > 24) {
      res.sendStatus(400)
      return
    }
    u.password.encryptedPassword = await bcrypt.hash(password, bcryptSaltRounds)
  }
  u.name = name
  u.password.userName = userName
  u.email = email || null
  u.address = address || null
  await nonAdminRepository.save(u)

  res.sendStatus(200)
})

// Create another admin user (done by admin)
router.post('/admins', withAuth, async (req, res) => {
  if (req.session.profile?.role !== 'ADMIN') {
    res.sendStatus(403) // Only the admin user is authorized
    return
  }
  const adminID = req.session.profile?.ID
  if (adminID === undefined || adminID === null) {
    res.sendStatus(403)
    return
  }
  const username = req.body.username
  const password = req.body.password
  const name = req.body.name

  if (!username || username.length < 3 || username.length > 24) {
    res.sendStatus(400)
    return
  }
  if (!password || password.length < 5 || password.length > 24) {
    res.sendStatus(400)
    return
  }
  // Create admin entity
  const admin = new Administrator()
  admin.name = name
  // Create password entity for admin
  admin.password = new UserPassword()

  admin.type = EUserType.ADMIN
  // Update password details
  admin.password.encryptedPassword = await bcrypt.hash(
    password,
    bcryptSaltRounds,
  )
  admin.password.userName = username
  const passwordExpiryDate = new Date()
  passwordExpiryDate.setMonth(passwordExpiryDate.getMonth() + 6)
  admin.password.passwordExpiryTime = 60 * 60 * 24 * 7 // Require new signin after 1 week
  const accountExpiryDate = new Date()
  accountExpiryDate.setFullYear(accountExpiryDate.getFullYear() + 10)
  admin.password.userAccountExpiryDate = accountExpiryDate // Expire in 10 years
  await adminRepository.save(admin) // Save new admin in database
  res.sendStatus(200)
})

export default router
