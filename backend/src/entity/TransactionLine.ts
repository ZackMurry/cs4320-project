import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Transaction } from './Transaction.js'
import { MasterAccount } from './MasterAccount.js'
import { recalculateClosingAmount } from '../util/recalculateClosingAmount.js'

export enum EEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity()
export class TransactionLine {
  @PrimaryGeneratedColumn()
  ID: number

  @Column('numeric', { precision: 14, scale: 2 })
  amount: number

  @Column({ type: 'text' })
  comment: string

  @Column()
  transactionID: number

  @ManyToOne('Transaction', (t: Transaction) => t.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transactionID' })
  transaction: Transaction

  @Column()
  accountID: number

  @ManyToOne('MasterAccount', (ma: MasterAccount) => ma.transactionLines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountID' })
  account: MasterAccount

  @Column({
    type: 'enum',
    enum: EEntryType,
    enumName: 'entry_type_enum',
  })
  type: EEntryType

  @AfterInsert()
  @AfterUpdate()
  @AfterRemove()
  async updateMasterAccountClosingAmount() {
    await recalculateClosingAmount(this.accountID)
  }
}
