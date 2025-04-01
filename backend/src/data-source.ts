import { DataSource } from 'typeorm'
import { iFINANCEUser } from './entity/iFINANCEUser.js'
import { Administrator } from './entity/Administrator.js'
import { NonAdminUser } from './entity/NonAdminUser.js'
import { UserPassword } from './entity/UserPassword.js'

console.log('Initializing data source...')

// todo: course opt-in, nickname

export const db = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'greSQLdb',
  database: 'group14_ifinancedb',
  synchronize: true,
  logging: true,
  entities: [iFINANCEUser, Administrator, NonAdminUser, UserPassword],
  subscribers: [],
  migrations: [],
})

export default db
