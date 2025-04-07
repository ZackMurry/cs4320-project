'use client'

import DashboardPage from '@/components/DashboardPage'
import { Heading } from '@radix-ui/themes'
import { useState } from 'react'

const IFinanceDashboard = () => {
  const [error, setError] = useState<string>('')

  return (
    <DashboardPage>
      <Heading>iFINANCE User Dashboard</Heading>
      <Heading as='h3' className='text-sm py-5'>
        Home
      </Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </DashboardPage>
  )
}

export default IFinanceDashboard
