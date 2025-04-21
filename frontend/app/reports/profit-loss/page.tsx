'use client'

import DashboardPage from '@/components/DashboardPage'
import { FullMasterAccount } from '@/lib/types'
import { Heading, Table } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const ProfitAndLossPage = () => {
  const [error, setError] = useState<string>('')
  const [accounts, setAccounts] = useState<FullMasterAccount[]>([])

  useEffect(() => {
    const fetchAccounts = async () => {
      const res = await fetch('/api/v1/accounts')
      if (res.ok) {
        const data = (await res.json()) as FullMasterAccount[]
        setAccounts(data)
      } else {
        setError('Error fetching accounts')
      }
    }
    fetchAccounts()
  }, [])

  const incomeAccounts = accounts.filter(
    (acc) => acc.group.category.name === 'Income',
  )
  const expenseAccounts = accounts.filter(
    (acc) => acc.group.category.name === 'Expenses',
  )

  const total = (accs: FullMasterAccount[]) =>
    accs.reduce((sum, acc) => sum + (acc.closingAmount - acc.openingAmount), 0)

  const totalIncome = total(incomeAccounts)
  const totalExpenses = total(expenseAccounts)
  const netProfit = totalIncome - totalExpenses

  return (
    <DashboardPage>
      <Heading mb='3'>Profit and Loss Statement</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Account Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {incomeAccounts.map((acc) => (
            <Table.Row key={acc.ID}>
              <Table.Cell>{acc.group.category.name}</Table.Cell>
              <Table.Cell>{acc.name}</Table.Cell>
              <Table.Cell>
                {fmt.format(acc.closingAmount - acc.openingAmount)}
              </Table.Cell>
            </Table.Row>
          ))}
          {expenseAccounts.map((acc) => (
            <Table.Row key={acc.ID}>
              <Table.Cell>{acc.group.category.name}</Table.Cell>
              <Table.Cell>{acc.name}</Table.Cell>
              <Table.Cell>
                {fmt.format(acc.closingAmount - acc.openingAmount)}
              </Table.Cell>
            </Table.Row>
          ))}
          <Table.Row>
            <Table.Cell className='font-bold'>Totals</Table.Cell>
            <Table.Cell className='font-bold'>Total Income</Table.Cell>
            <Table.Cell className='font-bold'>
              {fmt.format(totalIncome)}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className='font-bold'></Table.Cell>
            <Table.Cell className='font-bold'>Total Expenses</Table.Cell>
            <Table.Cell className='font-bold'>
              {fmt.format(totalExpenses)}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className='font-bold'>Net Profit</Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell className='font-bold'>
              {fmt.format(netProfit)}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </DashboardPage>
  )
}

export default ProfitAndLossPage
