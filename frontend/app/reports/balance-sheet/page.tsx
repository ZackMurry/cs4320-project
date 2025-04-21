'use client'

import DashboardPage from '@/components/DashboardPage'
import { FullMasterAccount } from '@/lib/types'
import { Heading, Table } from '@radix-ui/themes'
import { useEffect, useState } from 'react'

const BalanceSheetPage = () => {
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

  const assets = accounts.filter((acc) => acc.group.category.name === 'Assets')
  const liabilities = accounts.filter(
    (acc) => acc.group.category.name === 'Liabilities',
  )

  const total = (list: FullMasterAccount[]) =>
    list.reduce((sum, acc) => sum + acc.closingAmount, 0)

  return (
    <DashboardPage>
      <Heading mb='3'>Balance Sheet</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      <div className='grid grid-cols-2 gap-10'>
        {/* Left Column: Assets */}
        <div>
          <h2 className='text-lg font-semibold mb-2'>Assets</h2>
          <Table.Root variant='surface'>
            <Table.Body>
              {assets.map((acc) => (
                <Table.Row key={acc.ID}>
                  <Table.Cell>{acc.name}</Table.Cell>
                  <Table.Cell>{acc.closingAmount.toFixed(2)}</Table.Cell>
                </Table.Row>
              ))}
              <Table.Row className='font-bold'>
                <Table.Cell>Total Assets</Table.Cell>
                <Table.Cell>{total(assets).toFixed(2)}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </div>

        {/* Right Column: Liabilities */}
        <div>
          <h2 className='text-lg font-semibold mb-2'>Liabilities</h2>
          <Table.Root variant='surface'>
            <Table.Body>
              {liabilities.map((acc) => (
                <Table.Row key={acc.ID}>
                  <Table.Cell>{acc.name}</Table.Cell>
                  <Table.Cell>{acc.closingAmount.toFixed(2)}</Table.Cell>
                </Table.Row>
              ))}
              <Table.Row className='font-bold'>
                <Table.Cell>Total Liabilities</Table.Cell>
                <Table.Cell>{total(liabilities).toFixed(2)}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </div>
      </div>
      {/* Bottom: Assets - Liabilities */}
      <div>
        <h2 className='text-lg font-semibold my-2'>Net Balance</h2>
        <Table.Root variant='surface'>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Total Assets</Table.Cell>
              <Table.Cell>{total(assets).toFixed(2)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Total Liabilities</Table.Cell>
              <Table.Cell>{total(liabilities).toFixed(2)}</Table.Cell>
            </Table.Row>
            <Table.Row className='font-bold'>
              <Table.Cell>Assets - Liabilities</Table.Cell>
              <Table.Cell>
                {(total(assets) - total(liabilities)).toFixed(2)}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </div>
    </DashboardPage>
  )
}

export default BalanceSheetPage
