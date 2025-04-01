import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
import { UserPassword } from './UserPassword.js'

@Entity()
@TableInheritance({})
export class iFINANCEUser {
  @PrimaryGeneratedColumn()
  ID: number

  @Column()
  name: string

  @OneToOne('UserPassword', (password: UserPassword) => password.user, {
    cascade: true,
  })
  @JoinColumn()
  password: UserPassword
}
