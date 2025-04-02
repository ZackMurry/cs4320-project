import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { iFINANCEUser } from './iFINANCEUser.js'
import { Administrator, IAdministrator } from './Administrator.js'

@Entity()
export class NonAdminUser extends iFINANCEUser {
  @Column({ type: 'text', nullable: true })
  address: string | null

  @Column({ type: 'text', nullable: true })
  email: string | null

  @ManyToOne('Administrator')
  administrator: IAdministrator
}
