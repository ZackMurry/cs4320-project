import { DataSource } from 'typeorm'

console.log('Initializing data source...')

// todo: course opt-in, nickname

export const db = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'greSQLdb',
  database: 'Group14_iFINANCEDB',
  synchronize: true,
  logging: true,
  entities: [],
  subscribers: [],
  migrations: [],
})

export default db
