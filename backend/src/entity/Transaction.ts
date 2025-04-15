import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { NonAdminUser } from './NonAdminUser.js'
import { TransactionLine } from './TransactionLine.js'
import { format } from 'date-fns'
import { Expose } from 'class-transformer'

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

  @OneToMany('TransactionLine', (tl: TransactionLine) => tl.transaction, {
    eager: true,
  })
  lines: TransactionLine[]

  @Expose()
  get formattedDate(): string | null {
    return this.date ? format(this.date, 'yyyy/MM/dd') : null
  }

  @Expose()
  get totalDebit(): number {
    if (!this.lines) return 0
    const result = this.lines
      .filter((line) => line.type === 'DEBIT')
      .map((line) => Number(line.amount))
      .reduce((acc, cur) => acc + cur)
    return result
  }

  @Expose()
  get totalCredit(): number {
    if (!this.lines) return 0
    const result = this.lines
      .filter((line) => line.type === 'CREDIT')
      .map((line) => Number(line.amount))
      .reduce((acc, cur) => acc + cur)
    return result
  }
}
