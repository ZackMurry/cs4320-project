import { NamedAccount, TransactionLine } from '@/lib/types'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onError: (er: string) => void
  onAdd: (txnLine: TransactionLine) => void
  transactionID: number
  accounts: NamedAccount[]
}

const AddTransactionLineDialog: FC<Props> = ({
  isOpen,
  onClose,
  onError,
  onAdd,
  transactionID,
  accounts,
}) => {
  const [amount, setAmount] = useState('0')
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT')
  const [comment, setComment] = useState('')
  const [accountID, setAccountID] = useState<number | null>(null)

  const addTransactionLine = async () => {
    if (isNaN(Number(amount))) {
      onError('You must enter a non-zero amount!')
      return
    }
    if (accountID === null) {
      onError('You must select an account!')
      return
    }
    const res = await fetch(`/api/v1/transactions/id/${transactionID}/lines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(amount),
        type,
        comment,
        accountID,
      }),
    })
    if (res.ok) {
      const newLine = await res.json()
      onAdd(newLine)
      setAmount('0')
      setType('CREDIT')
      setComment('')
      setAccountID(null)
    } else {
      onError('Error creating transaction line')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Add Transaction Line</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Add a debit or credit entry to the transaction.
        </Dialog.Description>

        <Flex direction='column' gap='3'>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Account
            </Text>
            <Select.Root
              onValueChange={(val) =>
                val ? setAccountID(Number.parseInt(val)) : setAccountID(null)
              }
            >
              <Select.Trigger className='!min-w-[150px]' />
              <Select.Content>
                {accounts &&
                  accounts.map((a) => (
                    <Select.Item key={a.ID} value={String(a.ID)}>
                      {a.fullName}
                    </Select.Item>
                  ))}
              </Select.Content>
            </Select.Root>
          </label>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Type
            </Text>
            <Select.Root
              onValueChange={(val) => setType(val as 'CREDIT' | 'DEBIT')}
              value={type}
            >
              <Select.Trigger className='!min-w-[100px]' />
              <Select.Content>
                <Select.Item value='CREDIT'>Credit</Select.Item>
                <Select.Item value='DEBIT'>Debit</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Amount
            </Text>
            <TextField.Root
              value={amount}
              type='number'
              onChange={(e) => setAmount(e.target.value)}
              placeholder='Amount to debit/credit account'
            />
          </label>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Comments
            </Text>
            <TextField.Root
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Notes about transaction'
            />
          </label>
        </Flex>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray'>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={addTransactionLine}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AddTransactionLineDialog
