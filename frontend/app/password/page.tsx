'use client'

import DashboardPage from '@/components/DashboardPage'
import { Button, Heading } from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import { FC, FormEvent, useState } from 'react'
import FormEntry from '@/components/FormEntry'

// Page to change the current user's password
const ChangePasswordPage: FC = () => {
  // Declare persistent variables
  const [password, setPassword] = useState({ value: '', modified: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Submit the new password to the backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Validate password
    if (
      password.modified &&
      password.value.length &&
      (password.value.length < 5 || password.value.length > 24)
    ) {
      setError('Invalid password length')
      return
    }
    // If no change, don't transmit
    if (!password.modified) {
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.value,
        }), // Send data as JSON
      })

      if (response.ok) {
        console.log('User updated successfully')
      } else {
        console.error('Error updating user')
        setError(`Error updating user (status code ${response.status})`)
      }
      setLoading(false)
    } catch (error) {
      setError('Request failed' + error)
    }
  }

  return (
    <DashboardPage error={error} onCloseError={() => setError('')}>
      <div className='mx-auto max-w-[500px]'>
        <Heading className='py-5'>Change Password</Heading>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <Form.Root onSubmit={handleSubmit}>
          <FormEntry
            name='password'
            isRequired
            type='password'
            onChange={(e) =>
              setPassword({ modified: true, value: e.target.value })
            }
            value={password.modified ? password.value : 'supersecretpassword'}
          />
          <Form.Submit asChild>
            <Button className='!w-full !mt-5' type='submit' loading={loading}>
              Save changes
            </Button>
          </Form.Submit>
        </Form.Root>
      </div>
    </DashboardPage>
  )
}

export default ChangePasswordPage
