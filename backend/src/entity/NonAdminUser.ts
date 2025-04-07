import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { iFINANCEUser } from './iFINANCEUser.js'
import { IAdministrator } from './Administrator.js'
import { AccountGroup } from './AccountGroup.js'

@Entity()
export class NonAdminUser extends iFINANCEUser {
  @Column({ type: 'text', nullable: true })
  address: string | null

  @Column({ type: 'text', nullable: true })
  email: string | null

  @ManyToOne('Administrator')
  @JoinColumn()
  administrator: IAdministrator

  @OneToMany('AccountGroup', (g: AccountGroup) => g.user)
  groups: AccountGroup[]
}
