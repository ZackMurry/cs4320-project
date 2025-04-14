import {
  Category,
  CreateGroupRequest,
  Group,
  MasterAccount,
  MasterAccountResponse,
  NamedGroup,
} from '@/lib/types'
import { Button, Dialog, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onError: (er: string) => void
  onEdit: (account: MasterAccountResponse) => void
  groups: NamedGroup[]
  account: MasterAccountResponse
}

const EditAccountDialog: FC<Props> = ({
  isOpen,
  onClose,
  onError,
  onEdit,
  groups,
  account,
}) => {
  const [name, setName] = useState(account.name)
  const [openingAmount, setOpeningAmount] = useState<number | null>(
    account.openingAmount,
  )
  const [group, setGroup] = useState<number | null>(account.groupID)

  const editAccount = async () => {
    if (!group) {
      onError('You must select an account group!')
      return
    }
    if (openingAmount === null) {
      onError('You must enter an opening amount!')
      return
    }
    const res = await fetch(`/api/v1/accounts/id/${account.ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        openingAmount,
        groupID: group,
      }),
    })
    if (res.ok) {
      // const { name, } = await res.json()
      // onAdd({ name, parentID, categoryID, ID, children: [] })
      // setName('')
      const newAct = await res.json()
      onEdit(newAct)
    } else {
      onError('Error creating account')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Edit Account</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Edit an existing master account.
        </Dialog.Description>

        <Flex direction='column' gap='3'>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='New account name'
            />
          </label>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Opening Amount
            </Text>
            <TextField.Root
              value={openingAmount ?? ''}
              onChange={(e) =>
                setOpeningAmount(
                  e.target.value ? Number.parseFloat(e.target.value) : null,
                )
              }
              placeholder='Initial funds'
              type='number'
            />
          </label>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Group Name
            </Text>
            <Select.Root
              onValueChange={(val) =>
                val ? setGroup(Number.parseInt(val)) : setGroup(null)
              }
              value={`${group}`}
            >
              <Select.Trigger className='!min-w-[150px]' />
              <Select.Content>
                {groups &&
                  groups.map((g) => (
                    <Select.Item key={g.id} value={`${g.id}`}>
                      {g.fullName}
                    </Select.Item>
                  ))}
              </Select.Content>
            </Select.Root>
          </label>
        </Flex>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray'>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button onClick={editAccount}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default EditAccountDialog
