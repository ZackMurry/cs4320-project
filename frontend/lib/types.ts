export interface NonAdminUser {
  ID: number
  userName: string
  name: string
  type: 'USER' | 'ADMIN'
  address: string
  email: string
}

export interface Administrator {
  ID: number
  name: string
  type: 'ADMIN'
  dateHired?: string
  dateFinished?: string
}

export interface Password {
  ID: number
  userName: string
  passwordExpiryTime: number
  userAccountExpiryDate: string
}

export interface NonAdminEntity extends NonAdminUser {
  administrator: Administrator
  password: Password
}

export interface AdminProfile {
  ID: number
  userName: string
  name: string
  role: 'ADMIN'
}
