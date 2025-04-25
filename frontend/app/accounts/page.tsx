'use client'
import AddAccountDialog from '@/components/dialog/AddAccountDialog'
import DashboardPage from '@/components/DashboardPage'
import EditAccountDialog from '@/components/dialog/EditAccountDialog'
import {
  GroupTreeResponse,
  MasterAccountResponse,
  NamedGroup,
} from '@/lib/types'
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
import buildGroupArray from '@/lib/buildGroupArray'

// Page for managing chart of accounts
const ManageChartOfAccounts = () => {
  // Persistent variables
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const [groups, setGroups] = useState<NamedGroup[]>([])
  const [accounts, setAccounts] = useState<MasterAccountResponse[]>()
  const [selectedAccount, setSelectedAccount] =
    useState<MasterAccountResponse | null>(null)

  // useEffect runs only on the first render
  useEffect(() => {
    // Fetch groups from the backend
    const fetchGroups = async () => {
      const res = await fetch('/api/v1/groups')
      if (res.ok) {
        const { groups, categories } = (await res.json()) as GroupTreeResponse
        // Build group array with full names, and then sort in alphabetical order
        const groupList = buildGroupArray(groups, categories).sort((a, b) =>
          a.fullName.localeCompare(b.fullName),
        )
        setGroups(groupList)
      } else {
        setError('Failed to load groups')
      }
    }
    fetchGroups()

    // Fetch accounts from the backend
    const fetchAccounts = async () => {
      const res = await fetch('/api/v1/accounts')
      if (res.ok) {
        const acts = (await res.json()) as MasterAccountResponse[]
        setAccounts(acts)
      }
    }
    fetchAccounts()
  }, [])

  // Update accounts to include a new account
  const handleAdd = (a: MasterAccountResponse) => {
    setAccounts((acs) => [...(acs ?? []), a])
  }
  // Modify the details of one account
  const handleEdit = (a: MasterAccountResponse) => {
    if (!accounts) {
      setAccounts([a])
      return
    }
    const idx = accounts.findIndex((ac) => ac.ID === a.ID)
    const newAcs = [...accounts]
    newAcs[idx] = a
    setAccounts(newAcs)
    setSelectedAccount(null)
  }

  // Opens the edit dialog with the context of the current account
  const handleEditAccount = (act: MasterAccountResponse) => {
    setSelectedAccount(act)
    setDialog('edit')
  }

  // Opens the delete dialog with the context of the current account
  const handleDeleteAccount = (act: MasterAccountResponse) => {
    setSelectedAccount(act)
  }

  // Delete account
  const confirmDelete = async () => {
    if (!accounts || !selectedAccount) {
      setError('Failed to delete account: no account selected.')
      setSelectedAccount(null)
      return
    }
    // Send request to backend
    const res = await fetch(`/api/v1/accounts/id/${selectedAccount.ID}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      const newAcs = [...accounts].filter((a) => a.ID !== selectedAccount.ID)
      setAccounts(newAcs)
    } else {
      setError(`Failed to delete account (code ${res.status})`)
    }

    setSelectedAccount(null)
  }

  return (
    <DashboardPage error={error} onCloseError={() => setError('')}>
      <Heading>Manage Chart of Accounts</Heading>

      <Button onClick={() => setDialog('add')} my='3'>
        Create Account
      </Button>
      <AddAccountDialog
        isOpen={dialog === 'add'}
        onAdd={handleAdd}
        onClose={() => setDialog(null)}
        onError={setError}
        groups={groups}
      />
      {selectedAccount && (
        <EditAccountDialog
          isOpen={dialog === 'edit'}
          onEdit={handleEdit}
          onClose={() => setDialog(null)}
          onError={setError}
          groups={groups}
          account={selectedAccount}
        />
      )}

      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Account Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Opening Amount</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Closing amount</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Group Name</Table.ColumnHeaderCell>
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
            <AlertDialog.Title>Delete Account</AlertDialog.Title>
            <AlertDialog.Description size='2'>
              Are you sure? This account and all related transactions will be
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
                  Delete {selectedAccount?.name}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
          <Table.Body>
            {accounts &&
              groups &&
              accounts
                .sort((a, b) => a.ID - b.ID)
                .map((a) => (
                  // render each row in the table
                  <Table.Row key={a.ID}>
                    <Table.RowHeaderCell>{a.ID}</Table.RowHeaderCell>
                    <Table.RowHeaderCell>{a.name}</Table.RowHeaderCell>
                    <Table.Cell>{a.openingAmount}</Table.Cell>
                    <Table.Cell>{a.closingAmount}</Table.Cell>
                    <Table.Cell>
                      {groups.findLast((g) => g.id === a.groupID)?.fullName ??
                        'None'}
                    </Table.Cell>
                    <Table.Cell>
                      <IconButton variant='ghost' color='gray'>
                        <Edit
                          width='20px'
                          height='20px'
                          onClick={() => handleEditAccount(a)}
                        />
                      </IconButton>
                    </Table.Cell>
                    <Table.Cell>
                      <AlertDialog.Trigger>
                        <IconButton
                          variant='ghost'
                          color='red'
                          onClick={() => handleDeleteAccount(a)}
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

export default ManageChartOfAccounts
