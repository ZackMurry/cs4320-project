import { Group } from '@/lib/types'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { FC } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  group: Group
}

const AddGroupDialog: FC<Props> = ({ isOpen, onClose, group }) => (
  <Dialog.Root open={isOpen} onOpenChange={onClose}>
    <Dialog.Content maxWidth='450px' className='z-[100]'>
      <Dialog.Title>Add Group</Dialog.Title>
      <Dialog.Description size='2' mb='4'>
        Create a group as a child of &quot;{group.label}&quot;.
      </Dialog.Description>

      <Flex direction='column' gap='3'>
        <label>
          <Text as='div' size='2' mb='1' weight='bold'>
            Name
          </Text>
          <TextField.Root placeholder='Enter the name of the new group' />
        </label>
      </Flex>

      <Flex gap='3' mt='4' justify='end'>
        <Dialog.Close>
          <Button variant='soft' color='gray'>
            Cancel
          </Button>
        </Dialog.Close>
        <Dialog.Close>
          <Button>Save</Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
)

export default AddGroupDialog
