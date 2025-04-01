import { Button } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-gray-200 flex flex-col'>
      <div className='flex flex-col items-center justify-center flex-grow text-center p-6'>
        <h1 className='text-5xl font-bold text-blue-700 mb-4'>iFINANCE</h1>
        <a href='/login'>
          <Button className='bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg'>
            Login
          </Button>
        </a>
      </div>
    </div>
  )
}
