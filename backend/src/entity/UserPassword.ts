import {
  Column,
  Entity,
  JoinColumn,
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

  @Column({ type: 'int', nullable: true })
  passwordExpiryTime: number | null

  @Column({ type: 'timestamp', nullable: true })
  userAccountExpiryDate: Date | null

  @OneToOne('iFINANCEUser', (user: iFINANCEUser) => user.password, {
    onDelete: 'CASCADE',
  })
  user: IUser
}
