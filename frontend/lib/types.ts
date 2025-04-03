export interface NonAdminUser {
  ID: number
  name: string
  type: 'USER' | 'ADMIN'
  address: string
  email: string
}
