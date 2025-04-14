import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AccountGroup } from './AccountGroup.js'
import { TransactionLine } from './TransactionLine.js'

@Entity()
export class MasterAccount {
  @PrimaryGeneratedColumn()
  ID: number

  @Column()
  name: string

  @Column('numeric', {
    precision: 14,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  openingAmount: number

  @Column('numeric', {
    precision: 14,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  closingAmount: number

  @Column({ type: 'number', nullable: false })
  groupID: number

  @ManyToOne('AccountGroup', (group: AccountGroup) => group.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupID' })
  group: AccountGroup

  @OneToMany('TransactionLine', (tl: TransactionLine) => tl.account)
  transactionLines: TransactionLine[]
}
