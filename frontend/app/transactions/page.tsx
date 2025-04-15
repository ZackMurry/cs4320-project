'use client'
import AddTransactionDialog from '@/components/dialog/AddTransactionDialog'
import DashboardPage from '@/components/DashboardPage'
import { Transaction } from '@/lib/types'
import {
  AlertDialog,
  Button,
  Flex,
  Heading,
  IconButton,
  Table,
} from '@radix-ui/themes'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MouseEvent, useEffect, useState } from 'react'

const ManageTransactions = () => {
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<'add' | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch('/api/v1/transactions')
      if (res.ok) {
        const txns = (await res.json()) as Transaction[]
        setTransactions(txns)
      }
    }
    fetchTransactions()
  }, [])

  const handleAdd = (t: Transaction) => {
    setTransactions((txns) => [...(txns ?? []), t])
  }

  const handleDeleteTransaction = (e: MouseEvent, txn: Transaction) => {
    e.stopPropagation()
    setSelectedTxn(txn)
  }

  const confirmDelete = async () => {
    if (!transactions || !selectedTxn) {
      setError('Failed to delete transaction: no transaction selected.')
      setSelectedTxn(null)
      return
    }
    const res = await fetch(`/api/v1/transactions/id/${selectedTxn.ID}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      const newTxns = [...transactions].filter((t) => t.ID !== selectedTxn.ID)
      setTransactions(newTxns)
    } else {
      setError(`Failed to delete account (code ${res.status})`)
    }

    setSelectedTxn(null)
  }

  return (
    <DashboardPage>
      <Heading>Manage Transactions</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}

      <Button onClick={() => setDialog('add')} my='3'>
        Create Transaction
      </Button>
      <AddTransactionDialog
        isOpen={dialog === 'add'}
        onAdd={handleAdd}
        onClose={() => setDialog(null)}
        onError={setError}
      />

      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Total Debit</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Total Credit</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='w-[100px]'>
              Delete
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <AlertDialog.Root>
          <AlertDialog.Content maxWidth='450px'>
            <AlertDialog.Title>Delete Account</AlertDialog.Title>
            <AlertDialog.Description size='2'>
              Are you sure? This transaction and all related data will be
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
                  Delete Transaction {selectedTxn?.ID}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
          <Table.Body>
            {transactions &&
              transactions.map((t) => (
                <Table.Row
                  onClick={() => router.push(`/transactions/${t.ID}`)}
                  className='cursor-pointer'
                  key={t.ID}
                >
                  <Table.RowHeaderCell>{t.ID}</Table.RowHeaderCell>
                  <Table.RowHeaderCell>{t.formattedDate}</Table.RowHeaderCell>
                  <Table.Cell>{t.description}</Table.Cell>
                  <Table.Cell>{t.totalCredit}</Table.Cell>
                  <Table.Cell>{t.totalDebit}</Table.Cell>
                  {/* todo: total debit and credit */}
                  <Table.Cell>
                    <AlertDialog.Trigger>
                      <IconButton
                        variant='ghost'
                        color='red'
                        onClick={(e) => handleDeleteTransaction(e, t)}
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

export default ManageTransactions
