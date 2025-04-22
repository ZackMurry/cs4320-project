'use client'

import DashboardPage from '@/components/DashboardPage'
import { NonAdminUser } from '@/lib/types'
import {
  AlertDialog,
  Button,
  Flex,
  Heading,
  IconButton,
  Table,
} from '@radix-ui/themes'
import { Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const AdminDashboard = () => {
  const [users, setUsers] = useState<NonAdminUser[] | null>(null)
  const [selectedUser, setSelectedUser] = useState<NonAdminUser | null>(null)
  const [error, setError] = useState<string>('')

  const handleDeleteClick = (u: NonAdminUser) => {
    setSelectedUser(u)
  }

  const confirmDelete = async () => {
    if (!selectedUser) {
      setError('No user selected for deletion')
      return
    }
    const res = await fetch(`/api/v1/users/id/${selectedUser.ID}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      if (!users) return
      setUsers((us) => us!.filter((u) => u.ID !== selectedUser.ID))
    } else {
      setError('Failed to delete user')
    }
  }

  const editUser = (u: NonAdminUser) => {
    window.location.href = '/admin/users/' + u.ID
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/v1/users')
      if (res.ok) {
        const data = (await res.json()) as NonAdminUser[]
        setUsers(data)
      } else {
        console.error('Error fetching users!')
      }
    }
    fetchUsers()
  }, [])

  return (
    <DashboardPage isAdmin error={error} onCloseError={() => setError('')}>
      <Heading>Administrator Dashboard</Heading>
      <Heading as='h3' className='text-sm py-5'>
        Users
      </Heading>
      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Username</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Address</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='w-[100px] '>
              Edit
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='w-[100px]'>
              Delete
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <AlertDialog.Root>
          <AlertDialog.Content maxWidth='450px'>
            <AlertDialog.Title>Delete User</AlertDialog.Title>
            <AlertDialog.Description size='2'>
              Are you sure? This user and all of their financial data will be
              deleted.
            </AlertDialog.Description>

            <Flex gap='3' mt='4' justify='end'>
              <AlertDialog.Cancel>
                <Button variant='soft' color='gray'>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button variant='solid' color='red' onClick={confirmDelete}>
                  Delete {selectedUser?.name}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
          <Table.Body>
            {users &&
              users.map((u) => (
                <Table.Row key={u.ID}>
                  <Table.RowHeaderCell>{u.name}</Table.RowHeaderCell>
                  <Table.Cell>{u.userName}</Table.Cell>
                  <Table.Cell>{u.email}</Table.Cell>
                  <Table.Cell>{u.address}</Table.Cell>
                  <Table.Cell>
                    <IconButton variant='ghost' color='gray'>
                      <Edit
                        width='20px'
                        height='20px'
                        onClick={() => editUser(u)}
                      />
                    </IconButton>
                  </Table.Cell>
                  <Table.Cell>
                    <AlertDialog.Trigger>
                      <IconButton
                        variant='ghost'
                        color='red'
                        onClick={() => handleDeleteClick(u)}
                      >
                        <Trash2 width='20px' height='20px' />
                      </IconButton>
                    </AlertDialog.Trigger>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </AlertDialog.Root>
      </Table.Root>
    </DashboardPage>
  )
}

export default AdminDashboard
