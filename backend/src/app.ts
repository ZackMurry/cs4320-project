import express, { RequestHandler } from 'express'
import cors from 'cors'
import 'reflect-metadata'
import 'dotenv/config'
import db from './data-source.js'
import session from 'express-session'
import './types/types.js'

import userRoutes from './routes/users.js'
import groupRoutes from './routes/groups.js'
import accountRoutes from './routes/accounts.js'
import txnRoutes from './routes/transactions.js'
import seedCategories from './util/seedCategories.js'

// Entrypoint for backend

// Initialize database
db.initialize()
  .then(async () => {
    await seedCategories()
    console.log('Data source initialized!')
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err)
    process.exit(1)
  })

const app = express()
const port = 8080

// Set up middleware
app.use(cors())
app.use(express.json())

app.set('trust proxy', 1) // trust first proxy (NGINX)
app.use(
  session({
    name: 'ifinanceSession',
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // only works with HTTPS
      maxAge: 6000000, // 100 min
    },
  }),
)

// Use application routes
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/groups', groupRoutes)
app.use('/api/v1/accounts', accountRoutes)
app.use('/api/v1/transactions', txnRoutes)

// Logout route
app.get('/api/v1/logout', async (req, res) => {
  req.session.destroy((err) => {
    console.log('Destroyed session')
  })
  res.redirect('/')
})

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
