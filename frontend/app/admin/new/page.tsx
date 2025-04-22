'use client'

import DashboardPage from '@/components/DashboardPage'
import { Button, Heading, Select, TextField } from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import { FC, FormEvent, useState } from 'react'

const FormEntry: FC<{
  isRequired?: boolean
  name: string
  type?: 'text' | 'password' | 'email'
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ isRequired = false, type = 'text', name, onChange: handleChange }) => (
  <Form.Field name={name} className='my-3'>
    <Form.Label className='capitalize'>
      {name} {isRequired && <span className='text-red-500'>*</span>}
    </Form.Label>
    <Form.Control asChild>
      <TextField.Root
        type={type}
        required={isRequired}
        onChange={handleChange}
      />
    </Form.Control>
    <Form.Message match='valueMissing' color='red' className='text-red-500'>
      Please enter a {name}.
    </Form.Message>
    <Form.Message match='typeMismatch' color='red' className='text-red-500'>
      Please enter a valid {name}.
    </Form.Message>
  </Form.Field>
)

const AdminDashboard: FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    address: '',
  })
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    console.log('submit')
    try {
      const response = await fetch(
        `/api/v1/users${role === 'admin' ? '/admins' : ''}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body:
            role === 'user'
              ? JSON.stringify(formData)
              : JSON.stringify({
                  username: formData.username,
                  password: formData.password,
                  name: formData.name,
                }), // Send data as JSON
        },
      )

      if (response.ok) {
        console.log('User created successfully')
        // You can handle the success response here (e.g., redirect, show message)
        window.location.reload()
      } else {
        setError('Error creating user')
        // Handle error response here
      }
    } catch (error) {
      console.error('Request failed', error)
    }
  }

  return (
    <DashboardPage isAdmin error={error} onCloseError={() => setError('')}>
      <div className='mx-auto max-w-[500px]'>
        <Heading className='py-5'>Create New User</Heading>

        <Form.Root onSubmit={handleSubmit} action='/api/v1/users' method='POST'>
          <Form.Field name='role' className='my-3'>
            <Form.Label className='capitalize'>
              Role <span className='text-red-500'>*</span>
            </Form.Label>
            <div>
              <Form.Control asChild>
                <Select.Root
                  value={role}
                  onValueChange={(val) => setRole(val as 'user' | 'admin')}
                >
                  <Select.Trigger className='!w-full' />
                  <Select.Content>
                    <Select.Item value='user'>User</Select.Item>
                    <Select.Item value='admin'>Admin</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Form.Control>
            </div>
          </Form.Field>
          <FormEntry name='username' isRequired onChange={handleChange} />
          <FormEntry
            name='password'
            isRequired
            type='password'
            onChange={handleChange}
          />
          <FormEntry name='name' isRequired onChange={handleChange} />
          {role === 'user' && (
            <>
              <FormEntry name='email' type='email' onChange={handleChange} />
              <FormEntry name='address' onChange={handleChange} />
            </>
          )}
          <Form.Submit asChild>
            <Button className='!w-full !mt-5' type='submit'>
              Create {role}
            </Button>
          </Form.Submit>
        </Form.Root>
      </div>
    </DashboardPage>
  )
}

export default AdminDashboard
