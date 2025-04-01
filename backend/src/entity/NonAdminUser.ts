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
import { Administrator } from './Administrator.js'
import { iFINANCEUser } from './iFINANCEUser.js'

@Entity()
export class NonAdminUser extends iFINANCEUser {
  @Column({ type: 'text', nullable: true })
  address: string | null

  @Column({ type: 'text', nullable: true })
  email: string | null

  @ManyToOne('Administrator')
  AdministratorID: number
}
