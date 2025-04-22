'use client'

import DashboardPage from '@/components/DashboardPage'
import { CategoryType, FullMasterAccount } from '@/lib/types'
import { Button, Callout, Heading, Table, Text } from '@radix-ui/themes'
import { Info, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const TrialBalancePage = () => {
  const [error, setError] = useState<string>('')
  const [accounts, setAccounts] = useState<FullMasterAccount[]>([])
  const [now, setNow] = useState<string>('')

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
    setNow(new Date().toLocaleString())
  }, [])

  const sumType = (acType: CategoryType, otherType: CategoryType) =>
    accounts.reduce((accumulator, account) => {
      const dAmount = account.closingAmount - account.openingAmount
      let type = account.group.category.type
      if (dAmount < 0) {
        if (type === acType) {
          type = otherType
        } else {
          type = acType
        }
      }
      if (type === acType) {
        return accumulator + Math.abs(dAmount)
      }
      return accumulator
    }, 0)

  const totalDebit = sumType('DEBIT', 'CREDIT')
  const totalCredit = sumType('CREDIT', 'DEBIT')

  return (
    <DashboardPage error={error} onCloseError={() => setError('')}>
      <Heading mb='3'>Trial Balance Report</Heading>
      <div className='mb-3'>
        <Text>Generated: {now}</Text>
      </div>
      <Button onClick={() => window.print()} className='mb-4 no-print'>
        Print <Printer width='18' height='18' />
      </Button>
      {totalDebit !== totalCredit && (
        <Callout.Root color='red' my='3'>
          <Callout.Icon>
            <Info />
          </Callout.Icon>
          <Callout.Text>
            The total debit does not match the total credit.
          </Callout.Text>
        </Callout.Root>
      )}
      <Table.Root variant='surface' className='mt-4'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Account Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Debit Amount</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Credit Amount</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {accounts.map((acc) => {
            const dAmount = acc.closingAmount - acc.openingAmount
            let type = acc.group.category.type
            if (dAmount < 0) {
              if (type === 'DEBIT') {
                type = 'CREDIT'
              } else {
                type = 'DEBIT'
              }
            }
            return (
              <Table.Row key={acc.ID}>
                <Table.Cell>{acc.name}</Table.Cell>
                <Table.Cell>
                  {type === 'DEBIT' ? fmt.format(Math.abs(dAmount)) : ''}
                </Table.Cell>
                <Table.Cell>
                  {type === 'CREDIT' ? fmt.format(Math.abs(dAmount)) : ''}
                </Table.Cell>
              </Table.Row>
            )
          })}
          <Table.Row>
            <Table.Cell className='font-bold'>Totals</Table.Cell>
            <Table.Cell className='font-bold'>
              {fmt.format(totalDebit)}
            </Table.Cell>
            <Table.Cell className='font-bold'>
              {fmt.format(totalCredit)}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </DashboardPage>
  )
}

export default TrialBalancePage
