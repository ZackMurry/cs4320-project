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
import { MasterAccount } from './MasterAccount.js'

@Entity()
export class AccountGroup {
  @PrimaryGeneratedColumn()
  ID: number

  @Column()
  name: string

  @Column({ type: 'number', nullable: true })
  parentID: number | null

  @ManyToOne('AccountGroup', (group: AccountGroup) => group.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentID' })
  parent: AccountGroup | null

  @OneToMany('AccountGroup', (group: AccountGroup) => group.parent)
  children: AccountGroup[]

  @ManyToOne('NonAdminUser', (u: NonAdminUser) => u.groups)
  @JoinColumn()
  user: NonAdminUser

  @Column({ type: 'number', nullable: true })
  categoryID: number

  @ManyToOne('AccountingCategory', (ac: AccountingCategory) => ac.groups)
  @JoinColumn({ name: 'categoryID' })
  category: AccountingCategory

  @OneToMany('MasterAccount', (ma: MasterAccount) => ma.groupID)
  accounts: AccountGroup[]
}
