'use client'

import DashboardPage from '@/components/DashboardPage'
import { Button, Heading } from '@radix-ui/themes'

const AdminDashboard = () => (
  <DashboardPage isAdmin>
    <Heading>Administrator Dashboard</Heading>
    <Button>Create User</Button>
  </DashboardPage>
)

export default AdminDashboard
