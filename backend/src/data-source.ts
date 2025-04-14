import { DataSource } from 'typeorm'
import { iFINANCEUser } from './entity/iFINANCEUser.js'
import { Administrator } from './entity/Administrator.js'
import { NonAdminUser } from './entity/NonAdminUser.js'
import { UserPassword } from './entity/UserPassword.js'
import { AccountingCategory } from './entity/AccountingCategory.js'
import { AccountGroup } from './entity/AccountGroup.js'
import { MasterAccount } from './entity/MasterAccount.js'
import { Transaction } from './entity/Transaction.js'
import { TransactionLine } from './entity/TransactionLine.js'

console.log('Initializing data source...')

export const db = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'greSQLdb',
  database: 'group14_ifinancedb',
  synchronize: true,
  logging: true,
  entities: [
    iFINANCEUser,
    Administrator,
    NonAdminUser,
    UserPassword,
    AccountingCategory,
    AccountGroup,
    MasterAccount,
    Transaction,
    TransactionLine,
  ],
  subscribers: [],
  migrations: [],
})

export default db
