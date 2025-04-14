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
import { NonAdminUser } from './entity/NonAdminUser.js'
import { AccountingCategory } from './entity/AccountingCategory.js'
import seedCategories from './util/seedCategories.js'

db.initialize()
  .then(async () => {
    await seedCategories()
    console.log('Data source initialized!')
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err)
  })

const app = express()
const port = 8080
app.use(cors())

app.use(express.json())

app.set('trust proxy', 1) // trust first proxy
app.use(
  session({
    name: 'notionSession',
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // This will only work if you have https enabled!
      maxAge: 6000000, // 100 min
    },
  }),
)

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/groups', groupRoutes)
app.use('/api/v1/accounts', accountRoutes)

app.get('/api/v1/logout', async (req, res) => {
  req.session.destroy((err) => {
    console.log('Destroyed session')
  })
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
