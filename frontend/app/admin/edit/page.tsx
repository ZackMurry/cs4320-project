'use client'

import DashboardPage from '@/components/DashboardPage'
import { Button, Heading } from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import { FC, FormEvent, useEffect, useState } from 'react'
import { AdminProfile } from '@/lib/types'
import FormEntry from '@/components/FormEntry'

const EditAdminPage: FC = () => {
  const [user, setUser] = useState<AdminProfile | null>(null)
  const [password, setPassword] = useState({ value: '', modified: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // @ts-expect-error Form types
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('submit')
    if (!user) {
      return
    }
    const { name, userName } = user
    if (
      password.modified &&
      password.value.length &&
      (password.value.length < 5 || password.value.length > 24)
    ) {
      setError('Invalid password length')
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
          name,
          userName,
          password:
            password.modified && password.value.length
              ? password.value
              : undefined,
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
      console.error('Request failed', error)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/v1/users/me')
      if (res.ok) {
        const data = (await res.json()) as AdminProfile
        console.log(data)
        setUser(data)
      }
    }
    fetchUser()
  }, [setUser])

  return (
    <DashboardPage isAdmin error={error} onCloseError={() => setError('')}>
      <div className='mx-auto max-w-[500px]'>
        <Heading className='py-5'>Edit Administrator Account</Heading>
        {user && (
          <Form.Root
            onSubmit={handleSubmit}
            action='/api/v1/users'
            method='POST'
          >
            <FormEntry
              name='userName'
              isRequired
              onChange={handleChange}
              value={user.userName}
            />
            <FormEntry
              name='password'
              isRequired
              type='password'
              onChange={(e) =>
                setPassword({ modified: true, value: e.target.value })
              }
              value={password.modified ? password.value : 'supersecretpassword'}
            />
            <FormEntry
              name='name'
              isRequired
              onChange={handleChange}
              value={user.name}
            />
            <Form.Submit asChild>
              <Button className='!w-full !mt-5' type='submit' loading={loading}>
                Save changes
              </Button>
            </Form.Submit>
          </Form.Root>
        )}
      </div>
    </DashboardPage>
  )
}

export default EditAdminPage
