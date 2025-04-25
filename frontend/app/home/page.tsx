'use client'

import DashboardPage from '@/components/DashboardPage'
import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes'
import Link from 'next/link'

// Non-admin user dashboard
const IFinanceDashboard = () => {
  return (
    <DashboardPage>
      <Heading>iFINANCE User Dashboard</Heading>
      <Flex className='justify-between mt-5'>
        <Box maxWidth='350px'>
          <Card asChild>
            <Link href='/groups'>
              <Text as='div' size='2' weight='bold'>
                Manage Account Groups
              </Text>
              <Text as='div' color='gray' size='2'>
                Create, edit, and delete account groups in the four main
                accounting categories.
              </Text>
            </Link>
          </Card>
        </Box>
        <Box maxWidth='350px' mx='2'>
          <Card asChild>
            <Link href='/accounts'>
              <Text as='div' size='2' weight='bold'>
                Manage Chart of Accounts
              </Text>
              <Text as='div' color='gray' size='2'>
                Configure master accounts for representing financial entities.
              </Text>
            </Link>
          </Card>
        </Box>
        <Box maxWidth='350px'>
          <Card asChild>
            <Link href='/transactions'>
              <Text as='div' size='2' weight='bold'>
                Manage Transactions
              </Text>
              <Text as='div' color='gray' size='2'>
                Create or change transactions between master accounts.
              </Text>
            </Link>
          </Card>
        </Box>
      </Flex>
      <Box maxWidth='350px' mt='3'>
        <Card asChild>
          <Link href='/reports'>
            <Text as='div' size='2' weight='bold'>
              Generate Financial Reports
            </Text>
            <Text as='div' color='gray' size='2'>
              View summaries of your entered financial data, including a trial
              balance, a balance sheet, or a profit and loss statement.
            </Text>
          </Link>
        </Card>
      </Box>
    </DashboardPage>
  )
}

export default IFinanceDashboard
