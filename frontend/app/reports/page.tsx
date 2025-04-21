'use client'

import DashboardPage from '@/components/DashboardPage'
import { Heading, Text } from '@radix-ui/themes'
import { useState } from 'react'

const ReportsPage = () => {
  const [error, setError] = useState<string>('')

  return (
    <DashboardPage>
      <Heading>Generate Financial Reports</Heading>
      <div>
        <Text>
          <a href='/reports/trial-balance'>Trial Balance</a>
        </Text>
      </div>
      <div>
        <Text>
          <a href='/reports/profit-loss'>Profit and Loss Statement</a>
        </Text>
      </div>
      <div>
        <Text>
          <a href='/reports/balance-sheet'>Balance Sheet</a>
        </Text>
      </div>

      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </DashboardPage>
  )
}

export default ReportsPage
