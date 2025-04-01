'use client'
import React, { useState } from 'react'
import { TextField } from '@radix-ui/themes'

const LogInPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Failed to log in. Please check your credentials.')
      }

      console.log('auth worked!')
      if (window.location.search) {
        const redirectParam = new URLSearchParams(window.location.search).get(
          'redirect',
        )
        console.log('redirect:', redirectParam)
        if (redirectParam) {
          window.location.href = redirectParam
        } else {
          window.location.href = '/'
        }
      } else {
        window.location.href = '/admin'
      }

      // Handle successful login
      // alert('Login successful!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className='min-h-screen bg-gray-200 flex items-center justify-center flex'>
      <div className='bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Login</h1>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email Field */}
          <div>
            <label htmlFor='email' className='block text-sm font-medium mb-1'>
              Username
            </label>
            <TextField.Root
              placeholder='Username'
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium mb-1'
            >
              Password
            </label>
            <TextField.Root
              placeholder='Password'
              type='password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            className='w-full bg-blue-700 hover:bg-blue-600 py-2 rounded-md text-white font-medium transition duration-200'
          >
            Login
          </button>
          {error && <p className='text-red-500 text-sm'>{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default LogInPage
