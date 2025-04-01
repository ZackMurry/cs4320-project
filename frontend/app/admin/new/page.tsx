'use client'

import DashboardPage from '@/components/DashboardPage'
import { Heading } from '@radix-ui/themes'

const AdminDashboard = () => (
  <DashboardPage isAdmin>
    <Heading>Create New User</Heading>
  </DashboardPage>
)

export default AdminDashboard
