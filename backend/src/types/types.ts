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

export interface NonAdminProfile {
  userName: string
  password?: string
  name: string
  email?: string
  address?: string
}
