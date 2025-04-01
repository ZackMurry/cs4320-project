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
          <a
            href='/transactions'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Transactions
          </a>
          <a
            href='/reports'
            className='text-lg hover:text-gray-300 transition duration-200'
          >
            Reports
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header
