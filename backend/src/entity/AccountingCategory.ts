import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AccountGroup } from './AccountGroup.js'

export enum ECategoryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity()
export class AccountingCategory {
  @PrimaryGeneratedColumn()
  ID: number

  @Column()
  name: string

  @Column()
  type: ECategoryType

  @OneToMany('AccountGroup', (ag: AccountGroup) => ag.category)
  groups: AccountGroup[]
}
