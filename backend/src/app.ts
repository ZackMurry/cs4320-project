import express, { RequestHandler } from 'express'
import cors from 'cors'
import 'reflect-metadata'
import 'dotenv/config'
import db from './data-source.js'
import session from 'express-session'
import './types/types.js'

import userRoutes from './routes/users.js'
import { NonAdminUser } from './entity/NonAdminUser.js'

db.initialize()
  .then(() => console.log('Data source initialized!'))
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
console.log('1')

app.use('/api/v1/users', userRoutes)

const userRepository = db.getRepository(NonAdminUser)

app.get('/api/v1/logout', async (req, res) => {
  req.session.destroy((err) => {
    console.log('Destroyed session')
  })
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
