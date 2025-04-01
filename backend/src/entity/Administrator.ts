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

@Entity()
export class Administrator extends iFINANCEUser {
  @Column({ type: 'date', nullable: true })
  dateHired: string | null

  @Column({ type: 'date', nullable: true })
  dateFinished: string | null
}
