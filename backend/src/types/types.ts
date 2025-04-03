import 'express-session'

declare module 'express-session' {
  interface SessionData {
    profile?: {
      ID: number
      username: string
      role: 'ADMIN' | 'USER'
    }
  }
}
