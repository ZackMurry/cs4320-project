'use client'

import { LayoutDashboard, BookOpenCheck, Fingerprint } from 'lucide-react'
import * as framerMotion from 'framer-motion'
import { Heading, Text, Button, Card, Inset } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import Link from 'next/link'

export default function LandingPage() {
  const motion = framerMotion.motion
  return (
    <main className='min-h-screen bg-neutral-50 text-gray-900 min-h-[100vh] flex flex-col justify-between'>
      <div />
      <section className='max-w-5xl mx-auto px-6 py-20 h-full flex flex-col justify-center'>
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center'
        >
          <Heading as='h1' size='8' className='mb-4'>
            iFINANCE
          </Heading>
          <Text size='5' color='gray' className='max-w-2xl mx-auto'>
            Personal finance, professional precision. Track your finances with
            ease using our free online tool. Contact an administrator to gain
            access.
          </Text>
          <div className='mt-8'>
            <Link href='/login'>
              <Button
                size='3'
                className='bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg'
              >
                Login
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className='mt-20 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card size='3'>
            <Inset side='all' className='p-6'>
              <LayoutDashboard className='text-blue-700 w-10 h-10 mb-4' />
              <Heading as='h3' size='5' className='mb-2'>
                Intuitive Interface
              </Heading>
              <Text color='gray'>
                A minimalist, intuitive UI that cleanly presents your financial
                information.
              </Text>
            </Inset>
          </Card>

          <Card size='3'>
            <Inset side='all' className='p-6'>
              <BookOpenCheck className='text-blue-700 w-10 h-10 mb-4' />
              <Heading as='h3' size='5' className='mb-2'>
                Double-Entry Accounting
              </Heading>
              <Text color='gray'>
                Track your finances like the pros. Every entry has an equal and
                opposite entry, which is ensured by our balance checks.
              </Text>
            </Inset>
          </Card>

          <Card size='3'>
            <Inset side='all' className='p-6'>
              <Fingerprint className='text-blue-700 w-10 h-10 mb-4' />
              <Heading as='h3' size='5' className='mb-2'>
                Secure Access
              </Heading>
              <Text color='gray'>
                Each password is securely hashed using BCrypt.
              </Text>
            </Inset>
          </Card>
        </div>
      </section>
      <footer className='py-5 text-center'>
        <Text color='gray'>
          Made by Group 14: Zack Murry, Mike Huber, Jacob York, and Jagger
          Schmitz
        </Text>
      </footer>
    </main>
  )
}
