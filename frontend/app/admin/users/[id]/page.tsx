import DashboardPage from '@/components/DashboardPage'
import { Heading } from '@radix-ui/themes'
import { FC } from 'react'

const AdminUserPage: FC = () => {
  return (
    <DashboardPage isAdmin>
      <Heading>Edit User</Heading>
    </DashboardPage>
  )
}

export default AdminUserPage
