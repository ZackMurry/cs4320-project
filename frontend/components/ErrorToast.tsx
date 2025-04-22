import * as Toast from '@radix-ui/react-toast'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  error: string
  onClose: () => void
}

const ErrorToast: React.FC<Props> = ({ error, onClose }) => {
  return (
    <>
      <Toast.Root
        open={!!error}
        onOpenChange={onClose}
        className='bg-red-500 text-white rounded-xl shadow-md px-4 py-3 flex items-center justify-between gap-3 border border-red-700 ToastRoot'
        duration={10000}
      >
        <div className='flex justify-start align-center'>
          <AlertTriangle className='w-5 h-5 text-white opacity-80 mr-2' />
          <Toast.Title className='text-sm font-medium'>
            Error: {error}
          </Toast.Title>
        </div>
        <Toast.Close>
          <X className='w-5 h-5 text-white' />
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className='fixed bottom-5 right-5 w-80 max-w-full flex flex-col gap-2' />
    </>
  )
}

export default ErrorToast
