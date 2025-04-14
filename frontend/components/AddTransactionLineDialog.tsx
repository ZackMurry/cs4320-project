import { MasterAccountResponse, Transaction } from '@/lib/types'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'
import { format, isValid } from 'date-fns'

interface Props {
  isOpen: boolean
  onClose: () => void
  onError: (er: string) => void
  onAdd: (account: Transaction) => void
  transactionID: number
  accounts: MasterAccountResponse[]
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

  const addTransaction = async () => {
    if (isNaN(Number(amount))) {
      onError('You must enter a non-zero amount!')
      return
    }
    if (accountID === null) {
      onError('You must select an account!')
      return
    }
    const res = await fetch(`/api/v1/transactions/id/${transactionID}`, {
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
                    <Select.Item key={a.ID} value={`${a.ID}`}>
                      {/* {g.fullName} */}
                      {/* todo: group.fullName\\accountName */}
                    </Select.Item>
                  ))}
              </Select.Content>
            </Select.Root>
            <TextField.Root
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Transaction description'
            />
          </label>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Date
            </Text>
            <TextField.Root
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder='YYYY/MM/DD'
              onBlur={() =>
                setDate(
                  isValid(new Date(date))
                    ? format(new Date(date), 'yyyy/MM/dd')
                    : date,
                )
              }
              type='text'
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
            <Button onClick={addTransaction}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AddTransactionLineDialog
