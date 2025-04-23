import { RequestHandler } from 'express'

// Middleware to ensure the session exists
const withAuth: RequestHandler = (req, res, next) => {
  if (req.session.profile) {
    next()
  } else {
    res.redirect('/login')
  }
}

export default withAuth
