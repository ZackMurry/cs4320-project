'use client'

import DashboardPage from '@/components/DashboardPage'
import { FullMasterAccount } from '@/lib/types'
import { Button, Heading, Table, Text } from '@radix-ui/themes'
import { Printer } from 'lucide-react'
import { useEffect, useState } from 'react'

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Page for generating a profit and loss statement
const ProfitAndLossPage = () => {
  // Declare persistent variables
  const [error, setError] = useState<string>('')
  const [accounts, setAccounts] = useState<FullMasterAccount[]>([])
  const [now, setNow] = useState<string>('')

  // useEffect runs on first render
  useEffect(() => {
    // Get accounts from backend
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
    // Set timestamp for generated time
    setNow(new Date().toLocaleString())
  }, [])

  // List of accounts in the income category
  const incomeAccounts = accounts.filter(
    (acc) => acc.group.category.name === 'Income',
  )
  // List of accounts in the expenses category
  const expenseAccounts = accounts.filter(
    (acc) => acc.group.category.name === 'Expenses',
  )

  // Function to sum net changes in a list of accounts
  const total = (accs: FullMasterAccount[]) =>
    accs.reduce((sum, acc) => sum + (acc.closingAmount - acc.openingAmount), 0)

  // Sums of income and expenses
  const totalIncome = total(incomeAccounts)
  const totalExpenses = total(expenseAccounts)
  // Calculate net profit
  const netProfit = totalIncome - totalExpenses

  return (
    <DashboardPage error={error} onCloseError={() => setError('')}>
      <Heading mb='3'>Profit and Loss Statement</Heading>
      <div className='mb-3'>
        <Text>Generated: {now}</Text>
      </div>
      <Button onClick={() => window.print()} className='mb-4 no-print'>
        Print <Printer width='18' height='18' />
      </Button>
      <Table.Root variant='surface' className='mt-4'>
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
