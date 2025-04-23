import { RequestHandler } from 'express'

// Middleware to ensure that the session exists and it belongs to a non-admin user
const withUserAuth: RequestHandler = (req, res, next) => {
  if (req.session.profile) {
    if (req.session.profile.role === 'USER') {
      next()
    } else {
      res.sendStatus(403)
    }
  } else {
    res.redirect('/login')
  }
}

export default withUserAuth
