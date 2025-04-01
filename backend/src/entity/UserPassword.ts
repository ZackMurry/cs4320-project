import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { iFINANCEUser, IUser } from './iFINANCEUser.js'

@Entity()
export class UserPassword {
  @PrimaryGeneratedColumn()
  ID: number

  @Column()
  userName: string

  @Column()
  encryptedPassword: string

  @Column({ type: 'int' })
  passwordExpiryTime: number

  @Column({ type: 'timestamp' })
  userAccountExpiryDate: Date

  @OneToOne('iFINANCEUser', (user: iFINANCEUser) => user.password)
  user: IUser
}
