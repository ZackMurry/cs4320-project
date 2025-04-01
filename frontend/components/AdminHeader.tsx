import { Button, DropdownMenu, IconButton } from '@radix-ui/themes'
import { CircleUser, ShieldUser } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const AdminHeader: React.FC = () => {
  return (
    <header className='bg-blue-800 text-white shadow-md'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        {/* Logo */}
        <div className='text-2xl font-bold'>
          <h1>
            <Link href='/'>iFINANCE Admin Portal</Link>
          </h1>
        </div>

        {/* Navigation */}
        <nav className='flex space-x-8'>
          <a
            href='/admin/new'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Create Users
          </a>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                variant='outline'
                className='text-white !cursor-pointer'
              >
                <ShieldUser size='lg' className='text-white' />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item className='!cursor-pointer'>
                Change Password
              </DropdownMenu.Item>
              <DropdownMenu.Item className='!cursor-pointer' color='red'>
                Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </nav>
      </div>
    </header>
  )
}

export default AdminHeader
