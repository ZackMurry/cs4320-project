'use client'

import DashboardPage from '@/components/DashboardPage'
import { Box, Card, Flex, Heading, Text } from '@radix-ui/themes'

// Page that has links for generating the reports
const ReportsPage = () => (
  <DashboardPage>
    <Heading>Generate Financial Reports</Heading>
    <Flex className='justify-between mt-5'>
      <Box maxWidth='350px'>
        <Card asChild>
          <a href='/reports/trial-balance'>
            <Text as='div' size='2' weight='bold'>
              Trial Balance
            </Text>
            <Text as='div' color='gray' size='2'>
              Display the closing balances of all master accounts in a table
              with credit and debit totals.
            </Text>
          </a>
        </Card>
      </Box>
      <Box maxWidth='350px' mx='2'>
        <Card asChild>
          <a href='/reports/profit-loss'>
            <Text as='div' size='2' weight='bold'>
              Profit and Loss Statement
            </Text>
            <Text as='div' color='gray' size='2'>
              Display the closing balances of all master accounts in a table
              with credit and debit totals.
            </Text>
          </a>
        </Card>
      </Box>
      <Box maxWidth='350px'>
        <Card asChild>
          <a href='/reports/balance-sheet'>
            <Text as='div' size='2' weight='bold'>
              Balance Sheet
            </Text>
            <Text as='div' color='gray' size='2'>
              Display the closing balances of all master accounts in a table
              with credit and debit totals.
            </Text>
          </a>
        </Card>
      </Box>
    </Flex>
  </DashboardPage>
)

export default ReportsPage
