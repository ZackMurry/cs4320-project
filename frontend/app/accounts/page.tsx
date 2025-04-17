'use client'
import AddAccountDialog from '@/components/dialog/AddAccountDialog'
import DashboardPage from '@/components/DashboardPage'
import EditAccountDialog from '@/components/dialog/EditAccountDialog'
import {
  Category,
  Group,
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

const buildGroupArray = (
  groups: Group[],
  categories: Category[],
): NamedGroup[] => {
  const categoryMap = new Map<number, string>()
  categories.forEach((cat) => {
    categoryMap.set(cat.ID, cat.name)
  })

  const groupMap = new Map<number, Group>()
  groups.forEach((group) => {
    groupMap.set(group.ID, group)
  })

  const getFullName = (group: Group): string => {
    const names: string[] = []
    let current: Group | undefined = group

    while (current) {
      names.unshift(current.name)
      current =
        current.parentID !== null ? groupMap.get(current.parentID) : undefined
    }

    const rootCategory = categoryMap.get(group.categoryID)
    if (rootCategory) {
      names.unshift(rootCategory)
    }

    return names.join(`\\`)
  }

  return groups.map((group) => ({
    id: group.ID,
    fullName: getFullName(group),
  }))
}

const ManageChartOfAccounts = () => {
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const [groups, setGroups] = useState<NamedGroup[]>([])
  const [accounts, setAccounts] = useState<MasterAccountResponse[]>()
  const [selectedAccount, setSelectedAccount] =
    useState<MasterAccountResponse | null>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch('/api/v1/groups')
      if (res.ok) {
        const { groups, categories } = (await res.json()) as GroupTreeResponse
        const groupList = buildGroupArray(groups, categories).sort((a, b) =>
          a.fullName.localeCompare(b.fullName),
        )
        setGroups(groupList)
      } else {
        setError('Failed to load groups')
      }
    }
    fetchGroups()

    const fetchAccounts = async () => {
      const res = await fetch('/api/v1/accounts')
      if (res.ok) {
        const acts = (await res.json()) as MasterAccountResponse[]
        setAccounts(acts)
      }
    }
    fetchAccounts()
  }, [])

  const handleAdd = (a: MasterAccountResponse) => {
    setAccounts((acs) => [...(acs ?? []), a])
  }
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

  const handleEditAccount = (act: MasterAccountResponse) => {
    setSelectedAccount(act)
    setDialog('edit')
  }

  const handleDeleteAccount = (act: MasterAccountResponse) => {
    setSelectedAccount(act)
  }

  const confirmDelete = async () => {
    if (!accounts || !selectedAccount) {
      setError('Failed to delete account: no account selected.')
      setSelectedAccount(null)
      return
    }
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
    <DashboardPage>
      <Heading>Manage Chart of Accounts</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}

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
