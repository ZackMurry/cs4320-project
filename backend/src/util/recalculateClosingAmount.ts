import db from '../data-source.js'
import { ECategoryType } from '../entity/AccountingCategory.js'
import { MasterAccount } from '../entity/MasterAccount.js'
import { EEntryType, TransactionLine } from '../entity/TransactionLine.js'

export async function recalculateClosingAmount(accountId: number) {
  await new Promise((res) => setTimeout(res, 50)) // give the database time to commit
  const accountRepository = db.getRepository(MasterAccount)
  const txnLineRepository = db.getRepository(TransactionLine)
  const account = await accountRepository.findOne({
    where: { ID: accountId },
    relations: ['transactionLines', 'group', 'group.category'],
  })
  if (!account) {
    console.error('Failed to recalculate closing amount: account not found')
    return
  }

  const accountType = account.group.category.type
  const isAccountDebit = accountType === ECategoryType.DEBIT

  const lines = await txnLineRepository.find({
    where: { accountID: accountId },
  })

  const netAmount = lines.reduce((sum, line) => {
    const amount = parseFloat(line.amount.toString())
    const isLineDebit = line.type === EEntryType.DEBIT
    const signedAmount = isAccountDebit === isLineDebit ? amount : -amount
    console.log('line has effect of ', signedAmount)
    return sum + signedAmount
  }, 0)

  account.closingAmount = account.openingAmount + netAmount
  console.log('closing amount for', account.name, ': ', account.closingAmount)
  await accountRepository.save(account)
}
