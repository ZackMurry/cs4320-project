import { RequestHandler } from 'express'

const withUserAuth: RequestHandler = (req, res, next) => {
  console.log(`Session Checker: ${req.session.id}`)
  console.log(req.session)
  if (req.session.profile) {
    console.log(`Found User Session`)
    if (req.session.profile.role === 'USER') {
      next()
    } else {
      console.log('user is admin!')
      res.sendStatus(403)
    }
  } else {
    console.log(`No User Session Found`)
    res.redirect('/login')
  }
}

export default withUserAuth
