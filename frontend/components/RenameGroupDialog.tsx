import { Category, Group } from '@/lib/types'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  node: Group | Category
  onError: (er: string) => void
  onRename: (val: string) => void
}

const RenameGroupDialog: FC<Props> = ({
  isOpen,
  onClose,
  node,
  onError,
  onRename,
}) => {
  const [name, setName] = useState(node.name)
  const renameGroup = async () => {
    const body = { name }
    if (!node.hasOwnProperty('categoryID')) {
      // This node is a category!
      onError('Root accounting categories cannot be renamed')
      return
    }
    const res = await fetch(`/api/v1/groups/id/${node.ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      onRename(name)
    } else {
      onError('Error creating group')
    }
  }
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Rename Group</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Change the name of &quot;{node.name}&quot;.
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
            <Button onClick={renameGroup}>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default RenameGroupDialog
