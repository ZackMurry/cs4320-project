import { Category, CreateGroupRequest, Group } from '@/lib/types'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  node: Group | Category
  onError: (er: string) => void
  onAdd: (group: Group) => void
}

const AddGroupDialog: FC<Props> = ({
  isOpen,
  onClose,
  node,
  onError,
  onAdd,
}) => {
  const [name, setName] = useState('')

  const addGroup = async () => {
    const body = { name } as CreateGroupRequest
    console.log(node)
    if (node.hasOwnProperty('categoryID')) {
      // Parent is group
      body.parent = node.ID
    } else {
      // Parent is category
      body.category = node.ID
    }
    console.log(body)
    const res = await fetch('/api/v1/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const { name, parentID, categoryID, ID } = await res.json()
      onAdd({ name, parentID, categoryID, ID, children: [] })
      setName('')
    } else {
      onError('Error creating group')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Add Group</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Create a group as a child of &quot;{node.name}&quot;.
        </Dialog.Description>

        <Flex direction='column' gap='3'>
          <label>
            <Text as='div' size='2' mb='1' weight='bold'>
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='New group name'
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
            <Button onClick={addGroup}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AddGroupDialog
