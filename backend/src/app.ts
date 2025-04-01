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

const canvasTestKey = process.env.CANVAS_TEST_KEY
if (!canvasTestKey) {
  console.error('CANVAS_TEST_KEY is undefined')
}

// The OAuth client ID from the integration page!
const notionClientId = '18bd872b-594c-806c-9912-0037f79b8fde'
// The OAuth client secret from the integration page!
const notionClientSecret = process.env.NOTION_CLIENT_SECRET

const notionAuthCode = btoa(`${notionClientId}:${notionClientSecret}`)

const stripeKey = process.env.STRIPE_KEY
if (!stripeKey) {
  console.error('Stripe key is not defined.')
  process.exit(1)
}

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

app.get('/api/v1/oauth/code/notion', async (req, res) => {
  console.log('Received oauth request')
  const { code } = req.query

  // Generate an access token with the code we got earlier and the client_id and client_secret we retrived earlier
  const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${notionAuthCode}`,
    },
    body: JSON.stringify({
      code,
      grant_type: 'authorization_code',
      // redirect_uri: 'http://localhost/dash',
    }),
  })

  // You want to save resp.data.workspace_id and resp.data.access_token if you want to make requests later with this Notion account (otherwise they'll need to reauthenticate)
  const tokenData = await tokenRes.json()
  console.log(tokenData)
  console.log(tokenData['owner']['user'])
  const userData = tokenData['owner']['user']
  const email = userData['person']['email']

  const dbUser = await userRepository.findOneBy({
    id: userData['id'],
  })
  let userExists = false
  if (dbUser) {
    console.log('User exists')
    userExists = true
  } else {
    console.log('Creating Stripe customer!')
    const cust = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userData['id'], // Notion user ID
      },
    })
    console.log('New user!')
    const user = new CanvasSyncUser()
    user.id = userData['id']
    user.name = userData['name']
    user.avatar_url = userData['avatar_url']
    user.email = email
    user.notion_access_token = tokenData['access_token']
    user.stripe_id = cust.id
    user.subscription_status = 'none'
    await userRepository.save(user)
  }
  console.log(req.session)
  req.session.profile = { email, id: userData['id'] }
  if (userExists) {
    res.redirect('/dashboard')
  } else {
    res.redirect('/setup')
  }
})

app.get('/api/v1/logout', async (req, res) => {
  req.session.destroy((err) => {
    console.log('Destroyed session')
  })
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
