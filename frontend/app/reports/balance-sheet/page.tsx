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

// Page for generating balance sheet reports
const BalanceSheetPage = () => {
  // Declare persistent variables
  const [error, setError] = useState<string>('')
  const [accounts, setAccounts] = useState<FullMasterAccount[]>([])
  const [now, setNow] = useState<string>('')

  // useEffect runs on the first render
  useEffect(() => {
    // Request accounts from backend
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
    // Set current timestamp (for generated timestamp)
    setNow(new Date().toLocaleString())
  }, [])

  // All assets
  const assets = accounts.filter((acc) => acc.group.category.name === 'Assets')
  // All liabilities
  const liabilities = accounts.filter(
    (acc) => acc.group.category.name === 'Liabilities',
  )

  // Function to sum closing amounts in a list of master accounts
  const total = (list: FullMasterAccount[]) =>
    list.reduce((sum, acc) => sum + acc.closingAmount, 0)

  return (
    <DashboardPage error={error} onCloseError={() => setError('')}>
      <Heading mb='3'>Balance Sheet</Heading>
      <div className='mb-3'>
        <Text>Generated: {now}</Text>
      </div>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
      <Button onClick={() => window.print()} className='mb-4 no-print'>
        Print <Printer width='18' height='18' />
      </Button>

      <div className='grid grid-cols-2 gap-10 mt-4'>
        {/* Left Column: Assets */}
        <div>
          <h2 className='text-lg font-semibold mb-2'>Assets</h2>
          <Table.Root variant='surface'>
            <Table.Body>
              {assets.map((acc) => (
                <Table.Row key={acc.ID}>
                  <Table.Cell>{acc.name}</Table.Cell>
                  <Table.Cell>{fmt.format(acc.closingAmount)}</Table.Cell>
                </Table.Row>
              ))}
              <Table.Row className='font-bold'>
                <Table.Cell>Total Assets</Table.Cell>
                <Table.Cell>{fmt.format(total(assets))}</Table.Cell>
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
                  <Table.Cell>{fmt.format(acc.closingAmount)}</Table.Cell>
                </Table.Row>
              ))}
              <Table.Row className='font-bold'>
                <Table.Cell>Total Liabilities</Table.Cell>
                <Table.Cell>{fmt.format(total(liabilities))}</Table.Cell>
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
              <Table.Cell>{fmt.format(total(assets))}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Total Liabilities</Table.Cell>
              <Table.Cell>{fmt.format(total(liabilities))}</Table.Cell>
            </Table.Row>
            <Table.Row className='font-bold'>
              <Table.Cell>Assets - Liabilities</Table.Cell>
              <Table.Cell>
                {fmt.format(total(assets) - total(liabilities))}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </div>
    </DashboardPage>
  )
}

export default BalanceSheetPage
