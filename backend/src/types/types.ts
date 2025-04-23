import 'express-session'

// Custom express session types
declare module 'express-session' {
  interface SessionData {
    profile?: {
      ID: number
      username: string
      role: 'ADMIN' | 'USER'
    }
  }
}

// Non admin profile
export interface NonAdminProfile {
  userName: string
  password?: string
  name: string
  email?: string
  address?: string
}

export interface AdminUpdateRequest {
  userName: string
  name: string
  password?: string
}
