import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { NonAdminUser } from './NonAdminUser.js'
import { AccountingCategory } from './AccountingCategory.js'
import { AccountGroup } from './AccountGroup.js'

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  ID: number

  @Column({ type: 'number', nullable: true })
  userID: number

  @ManyToOne('NonAdminUser', (u: NonAdminUser) => u.transactions)
  @JoinColumn({ name: 'userID' })
  user: NonAdminUser

  @Column({ type: 'date', nullable: true })
  date: Date

  @Column({ type: 'text' })
  description: string
}
