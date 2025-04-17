import db from '../data-source.js'
import { MasterAccount } from '../entity/MasterAccount.js'
import { EEntryType, TransactionLine } from '../entity/TransactionLine.js'

export async function recalculateClosingAmount(accountId: number) {
  const accountRepository = db.getRepository(MasterAccount)
  const txnLineRepository = db.getRepository(TransactionLine)
  const account = await accountRepository.findOne({
    where: { ID: accountId },
    relations: ['transactionLines'],
  })
  if (!account) {
    console.error('Failed to recalculate closing amount: account not found')
    return
  }

  const lines = await txnLineRepository.find({
    where: { accountID: accountId },
  })

  const netAmount = lines.reduce((sum, line) => {
    const signedAmount =
      line.type === EEntryType.DEBIT
        ? parseFloat(line.amount.toString())
        : -parseFloat(line.amount.toString())
    return sum + signedAmount
  }, 0)

  account.closingAmount = account.openingAmount + netAmount
  await accountRepository.save(account)
}
