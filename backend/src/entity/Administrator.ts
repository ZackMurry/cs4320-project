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
import { iFINANCEUser, IUser } from './iFINANCEUser.js'

export interface IAdministrator extends IUser {
  dateHired: string | null
  dateFinished: string | null
}

@Entity()
export class Administrator extends iFINANCEUser implements IAdministrator {
  @Column({ type: 'date', nullable: true })
  dateHired: string | null

  @Column({ type: 'date', nullable: true })
  dateFinished: string | null
}
