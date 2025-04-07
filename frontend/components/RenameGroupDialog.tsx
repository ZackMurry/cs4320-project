import { Category, Group } from '@/lib/types'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { FC } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  node: Group | Category
  onError: (er: string) => void
}

const RenameGroupDialog: FC<Props> = ({ isOpen, onClose, node, onError }) => (
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
            defaultValue={node.name}
            placeholder='The new group name'
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
          <Button>Save</Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
)

export default RenameGroupDialog
