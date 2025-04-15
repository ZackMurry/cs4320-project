import { NamedAccount, TransactionLine } from '@/lib/types'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onError: (er: string) => void
  onEdit: (txnLine: TransactionLine) => void
  accounts: NamedAccount[]
  transactionLine: TransactionLine
}

const EditTransactionLineDialog: FC<Props> = ({
  isOpen,
  onClose,
  onError,
  onEdit,
  accounts,
  transactionLine,
}) => {
  const [amount, setAmount] = useState(String(transactionLine.amount))
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>(transactionLine.type)
  const [comment, setComment] = useState(transactionLine.comment)
  const [accountID, setAccountID] = useState<number | null>(
    transactionLine.accountID,
  )

  const addTransactionLine = async () => {
    if (isNaN(Number(amount))) {
      onError('You must enter a non-zero amount!')
      return
    }
    if (accountID === null) {
      onError('You must select an account!')
      return
    }
    const res = await fetch(
      `/api/v1/transactions/lines/id/${transactionLine.ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          comment,
          accountID,
        }),
      },
    )
    if (res.ok) {
      const newLine = await res.json()
      onEdit(newLine)
    } else {
      onError('Error editing transaction line')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Edit Transaction Line</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Change a debit or credit entry in the transaction.
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
              value={String(accountID) ?? undefined}
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

export default EditTransactionLineDialog
