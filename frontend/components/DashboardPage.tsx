import { FC, PropsWithChildren } from 'react'
import Header from './Header'
import AdminHeader from './AdminHeader'

interface Props {
  isAdmin: boolean
}

const DashboardPage: FC<PropsWithChildren<Props>> = ({ children, isAdmin }) => (
  <div>
    {isAdmin ? <AdminHeader /> : <Header />}
    <div className='w-full min-h-screen bg-gray-200 py-5 px-[20vw]'>
      {children}
    </div>
  </div>
)

export default DashboardPage
