'use client'

import DashboardPage from '@/components/DashboardPage'
import { Button, Heading, TextField } from '@radix-ui/themes'

const AdminDashboard = () => (
  <DashboardPage isAdmin>
    <Heading>Administrator Dashboard</Heading>
  </DashboardPage>
)

export default AdminDashboard
