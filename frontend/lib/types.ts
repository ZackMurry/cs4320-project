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

export interface Group {
  ID: number
  name: string
  parentID: number | null
  categoryID: number
  children: Group[]
}

export type CategoryType = 'DEBIT' | 'CREDIT'

export interface Category {
  ID: number
  name: string
  type: CategoryType
}

export interface GroupTreeResponse {
  categories: Category[]
  groups: Group[]
}

export interface GroupTree extends Group {
  id: string
  label: string
}

export interface CategoryTree extends Category {
  id: string
  label: string
  children: GroupTree[]
}

export interface CreateGroupRequest {
  name: string
  parent?: number
  category?: number
}

export interface MasterAccount {
  name: string
  openingAmount: number
  groupID: number
}

export interface NamedGroup {
  id: number
  fullName: string
}

export interface MasterAccountResponse {
  ID: number
  name: string
  openingAmount: number
  closingAmount: number
  groupID: number
}
