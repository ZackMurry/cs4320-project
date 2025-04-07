import { Group } from '@/lib/types'
import { Button, Dialog, Flex } from '@radix-ui/themes'
import { FC } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  group: Group
}

const DeleteGroupDialog: FC<Props> = ({ isOpen, onClose, group }) => (
  <Dialog.Root open={isOpen} onOpenChange={onClose}>
    <Dialog.Content maxWidth='450px' className='z-[100]'>
      <Dialog.Title>Delete Group</Dialog.Title>
      <Dialog.Description size='2' mb='4'>
        Remove &quot;{group.label}&quot; and all of its sub-groups.
      </Dialog.Description>

      <Flex gap='3' mt='4' justify='end'>
        <Dialog.Close>
          <Button variant='soft' color='gray'>
            Cancel
          </Button>
        </Dialog.Close>
        <Dialog.Close>
          <Button color='red'>Delete</Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
)

export default DeleteGroupDialog
