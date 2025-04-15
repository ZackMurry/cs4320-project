'use client'
import AddAccountDialog from '@/components/AddAccountDialog'
import AddTransactionLineDialog from '@/components/AddTransactionLineDialog'
import DashboardPage from '@/components/DashboardPage'
import EditAccountDialog from '@/components/EditAccountDialog'
import EditTransactionLineDialog from '@/components/EditTransactionLineDialog'
import {
  Category,
  FullTransaction,
  Group,
  GroupTreeResponse,
  MasterAccountResponse,
  NamedAccount,
  NamedGroup,
  TransactionLine,
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
import { useParams } from 'next/navigation'
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

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const ManageTransaction = () => {
  const params = useParams()

  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const [groups, setGroups] = useState<NamedGroup[]>([])
  const [accounts, setAccounts] = useState<NamedAccount[]>()
  const [selectedLine, setSelectedLine] = useState<TransactionLine | null>(null)
  const [transaction, setTransaction] = useState<FullTransaction>()

  useEffect(() => {
    const fetchTransaction = async () => {
      const res = await fetch(`/api/v1/transactions/id/${params.id}`)
      if (res.ok) {
        const txn = await res.json()
        setTransaction(txn)
      } else {
        setError('Failed to load transaction')
      }
    }
    fetchTransaction()

    const fetchAccounts = async () => {
      const res = await fetch('/api/v1/groups')
      if (res.ok) {
        const { groups, categories } = (await res.json()) as GroupTreeResponse
        const groupList = buildGroupArray(groups, categories).sort((a, b) =>
          a.fullName.localeCompare(b.fullName),
        )
        setGroups(groupList)
        const aRes = await fetch('/api/v1/accounts')
        if (aRes.ok) {
          const acts = (await aRes.json()) as MasterAccountResponse[]
          const namedActs = []
          for (const act of acts) {
            namedActs.push({
              ID: act.ID,
              fullName:
                groupList.find((g) => g.id === act.groupID)?.fullName +
                '\\' +
                act.name,
            })
          }
          setAccounts(namedActs)
        }
      } else {
        setError('Failed to load groups')
      }
    }
    fetchAccounts()
  }, [params])

  const handleAdd = (l: TransactionLine) => {
    if (!transaction) return
    setTransaction({ ...transaction, lines: [...transaction.lines, l] })
    setSelectedLine(null)
  }
  const handleEdit = (l: TransactionLine) => {
    if (!transaction) {
      return
    }
    const idx = transaction.lines.findIndex((tl) => tl.ID === l.ID)
    const newTxns = [...transaction.lines]
    newTxns[idx] = l
    setTransaction({ ...transaction, lines: newTxns })
    setSelectedLine(null)
  }

  const handleEditLine = (l: TransactionLine) => {
    setSelectedLine(l)
    setDialog('edit')
  }

  const handleDeleteLine = (l: TransactionLine) => {
    setSelectedLine(l)
  }

  const confirmDelete = async () => {
    if (!transaction || !selectedLine) {
      setError('Failed to delete transaction line: no line selected.')
      setSelectedLine(null)
      return
    }
    const res = await fetch(
      `/api/v1/transactions/lines/id/${selectedLine.ID}`,
      {
        method: 'DELETE',
      },
    )
    if (res.ok) {
      setTransaction({
        ...transaction,
        lines: transaction.lines.filter((tl) => tl.ID !== selectedLine.ID),
      })
    } else {
      setError(`Failed to delete transaction line (code ${res.status})`)
    }

    setSelectedLine(null)
  }

  return (
    <DashboardPage>
      <Heading>Manage Transaction</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      <Button onClick={() => setDialog('add')} my='3'>
        Add Line
      </Button>
      {accounts && (
        <AddTransactionLineDialog
          isOpen={dialog === 'add'}
          onAdd={handleAdd}
          onClose={() => setDialog(null)}
          onError={setError}
          transactionID={Number(params.id)}
          accounts={accounts}
        />
      )}
      {accounts && selectedLine && (
        <EditTransactionLineDialog
          isOpen={dialog === 'edit'}
          onEdit={handleEdit}
          onClose={() => setDialog(null)}
          onError={setError}
          accounts={accounts}
          transactionLine={selectedLine}
        />
      )}

      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Account Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Comment</Table.ColumnHeaderCell>
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
            <AlertDialog.Title>Delete Transaction Line</AlertDialog.Title>
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
                  Delete Line {selectedLine?.ID}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
          <Table.Body>
            {transaction?.lines &&
              accounts &&
              transaction.lines.map((l) => (
                <Table.Row key={l.ID}>
                  <Table.RowHeaderCell>{l.ID}</Table.RowHeaderCell>
                  <Table.RowHeaderCell>
                    {accounts.find((a) => a.ID === l.accountID)?.fullName ??
                      'Unknown'}
                  </Table.RowHeaderCell>
                  <Table.Cell>{l.type}</Table.Cell>
                  <Table.Cell>{fmt.format(l.amount)}</Table.Cell>
                  <Table.Cell>{l.comment}</Table.Cell>
                  <Table.Cell>
                    <IconButton variant='ghost' color='gray'>
                      <Edit
                        width='20px'
                        height='20px'
                        onClick={() => handleEditLine(l)}
                      />
                    </IconButton>
                  </Table.Cell>
                  <Table.Cell>
                    <AlertDialog.Trigger>
                      <IconButton
                        variant='ghost'
                        color='red'
                        onClick={() => handleDeleteLine(l)}
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

export default ManageTransaction
