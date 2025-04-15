import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { CircleUser } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Header: React.FC = () => {
  return (
    <header className='bg-blue-800 text-white shadow-md'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        {/* Logo */}
        <div className='text-2xl font-bold'>
          <h1>
            <Link href='/'>iFINANCE</Link>
          </h1>
        </div>

        {/* Navigation */}
        <nav className='flex space-x-8'>
          <a
            href='/groups'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Groups
          </a>
          <a
            href='/accounts'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Accounts
          </a>
          <Link
            href='/transactions'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Transactions
          </Link>
          <a
            href='/reports'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Reports
          </a>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                variant='outline'
                className='text-white !cursor-pointer'
              >
                <CircleUser size='lg' className='text-white' />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item className='!cursor-pointer'>
                <a href='/password'>Change Password</a>
              </DropdownMenu.Item>
              <DropdownMenu.Item className='!cursor-pointer' color='red'>
                <a href='/api/v1/users/logout'>Log Out</a>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </nav>
      </div>
    </header>
  )
}

export default Header
