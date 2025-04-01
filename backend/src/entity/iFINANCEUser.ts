import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
import { UserPassword } from './UserPassword.js'

export enum EUserType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface IUser {
  ID: number
  name: string
  password: UserPassword
}

@Entity()
@TableInheritance({ column: 'type' })
export class iFINANCEUser implements IUser {
  @PrimaryGeneratedColumn()
  ID: number

  @Column()
  name: string

  @OneToOne('UserPassword', (password: UserPassword) => password.user, {
    cascade: true,
  })
  @JoinColumn()
  password: UserPassword

  @Column({ type: 'enum', enum: EUserType })
  type: EUserType
}
