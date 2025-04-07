import { Category, Group } from '@/lib/types'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { FC } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  node: Group | Category
  onError: (er: string) => void
}

const DeleteGroupDialog: FC<Props> = ({ isOpen, onClose, node, onError }) => {
  const onDelete = async () => {
    if (!node.hasOwnProperty('categoryID')) {
      // This node is a category!
      onError('Root accounting categories cannot be deleted')
      return
    }
    const res = await fetch(`/api/v1/groups/id/${node.ID}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      window.location.reload()
    } else {
      onError('Failed to delete group.')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content maxWidth='450px' className='z-[100]'>
        <Dialog.Title>Delete Group</Dialog.Title>
        <Dialog.Description size='2' mb='4'>
          Remove &quot;{node.name}&quot; and all of its sub-groups.
        </Dialog.Description>

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray'>
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button color='red' onClick={onDelete}>
              Delete
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default DeleteGroupDialog
