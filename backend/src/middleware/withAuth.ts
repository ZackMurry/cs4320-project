import { RequestHandler } from 'express'

const withAuth: RequestHandler = (req, res, next) => {
  console.log(`Session Checker: ${req.session.id}`)
  console.log(req.session)
  if (req.session.profile) {
    console.log(`Found User Session`)
    next()
  } else {
    console.log(`No User Session Found`)
    res.redirect('/login')
  }
}

export default withAuth
