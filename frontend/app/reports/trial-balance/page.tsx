'use client'

import DashboardPage from '@/components/DashboardPage'
import { CategoryType, FullMasterAccount } from '@/lib/types'
import { Callout, Heading, Table } from '@radix-ui/themes'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'

const TrialBalancePage = () => {
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
    <DashboardPage>
      <Heading mb='3'>Trial Balance Report</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
      {totalDebit !== totalCredit && (
        <Callout.Root color='red' mt='3'>
          <Callout.Icon>
            <Info />
          </Callout.Icon>
          <Callout.Text>
            The total debit does not match the total credit.
          </Callout.Text>
        </Callout.Root>
      )}
      <Table.Root variant='surface'>
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
                  {type === 'DEBIT' ? Math.abs(dAmount) : ''}
                </Table.Cell>
                <Table.Cell>
                  {type === 'CREDIT' ? Math.abs(dAmount) : ''}
                </Table.Cell>
              </Table.Row>
            )
          })}
          <Table.Row>
            <Table.Cell className='font-bold'>Totals</Table.Cell>
            <Table.Cell className='font-bold'>{totalDebit}</Table.Cell>
            <Table.Cell className='font-bold'>{totalCredit}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </DashboardPage>
  )
}

export default TrialBalancePage
