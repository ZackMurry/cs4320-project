import { Transaction } from '@/lib/types'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'
import { format, isValid } from 'date-fns'

interface Props {
  isOpen: boolean
  onClose: () => void
  onError: (er: string) => void
  onAdd: (txn: Transaction) => void
}

const AddTransactionDialog: FC<Props> = ({
  isOpen,
  onClose,
  onError,
  onAdd,
}) => {
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<string>(() =>
    format(new Date(), 'yyyy/MM/dd'),
  )

  const addTransaction = async () => {
    if (!date) {
      onError('You must enter a transaction date!')
      return
    }
    const res = await fetch('/api/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        date,
      }),
    })
    if (res.ok) {
      const newTxn = await res.json()
      onAdd(newTxn)
    } else {
      onError('Error creating transaction')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Add Transaction</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Create a transaction between master accounts.
        </Dialog.Description>

        <Flex direction='column' gap='3'>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Description
            </Text>
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

export default AddTransactionDialog
