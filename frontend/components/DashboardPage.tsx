import { FC, PropsWithChildren } from 'react'
import Header from './Header'
import AdminHeader from './AdminHeader'
import ErrorToast from './ErrorToast'

interface Props {
  isAdmin?: boolean
  error?: string
  onCloseError?: () => void
}

const DashboardPage: FC<PropsWithChildren<Props>> = ({
  children,
  isAdmin = false,
  error,
  onCloseError,
}) => (
  <div className='min-h-screen bg-gray-200 w-full'>
    {isAdmin ? <AdminHeader /> : <Header />}
    <div className='w-full min-h-[400px] bg-gray-200 py-5 px-[20vw]'>
      {children}
    </div>
    {error && onCloseError && (
      <ErrorToast error={error} onClose={onCloseError} />
    )}
  </div>
)

export default DashboardPage
