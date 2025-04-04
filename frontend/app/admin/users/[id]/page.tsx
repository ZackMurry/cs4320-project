'use client'

import DashboardPage from '@/components/DashboardPage'
import { Button, Heading } from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import { FC, FormEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { NonAdminEntity } from '@/lib/types'
import FormEntry from '@/components/FormEntry'

const AdminUserPage: FC = () => {
  const params = useParams()
  const [user, setUser] = useState<NonAdminEntity | null>(null)
  const [password, setPassword] = useState({ value: '', modified: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'username') {
      setUser((u) => ({ ...u!, password: { ...u!.password, userName: value } }))
    } else {
      // @ts-expect-error Form types
      setUser((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('submit')
    if (!user) {
      return
    }
    const { address, email, name, password: pass } = user
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
      const response = await fetch(`/api/v1/users/id/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          email,
          name,
          userName: pass.userName,
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
        setError('Error updating user')
      }
      setLoading(false)
    } catch (error) {
      console.error('Request failed', error)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`/api/v1/users/id/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        console.log(data)
        setUser(data)
      }
    }
    fetchUser()
  }, [setUser, params.id])

  return (
    <DashboardPage isAdmin>
      <div className='mx-auto max-w-[500px]'>
        <Heading className='py-5'>Edit User Profile</Heading>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        {user && (
          <Form.Root
            onSubmit={handleSubmit}
            action='/api/v1/users'
            method='POST'
          >
            <FormEntry
              name='username'
              isRequired
              onChange={handleChange}
              value={user.password.userName}
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
            <FormEntry
              name='email'
              type='email'
              onChange={handleChange}
              value={user.email}
            />
            <FormEntry
              name='address'
              onChange={handleChange}
              value={user.address ?? ''}
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

export default AdminUserPage
