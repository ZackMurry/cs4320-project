import db from '../data-source.js'
import {
  AccountingCategory,
  ECategoryType,
} from '../entity/AccountingCategory.js'

// Create four base accounting categories if they don't exist
const seedCategories = async () => {
  const categoryRepository = db.getRepository(AccountingCategory)
  const count = await categoryRepository.count()
  if (count > 0) {
    return
  }
  console.log('Seeding categories')

  const categories = [
    {
      name: 'Assets',
      type: ECategoryType.DEBIT,
    },
    {
      name: 'Income',
      type: ECategoryType.CREDIT,
    },
    {
      name: 'Liabilities',
      type: ECategoryType.CREDIT,
    },
    {
      name: 'Expenses',
      type: ECategoryType.DEBIT,
    },
  ]
  for (let category of categories) {
    const cat = new AccountingCategory()
    cat.name = category.name
    cat.type = category.type
    await categoryRepository.save(cat)
  }
}

export default seedCategories
