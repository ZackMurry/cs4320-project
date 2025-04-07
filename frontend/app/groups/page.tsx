'use client'

import DashboardPage from '@/components/DashboardPage'
import { RichTreeView, TreeItem } from '@mui/x-tree-view'
import { Card, ContextMenu, Heading } from '@radix-ui/themes'
import { Square, SquareMinus, SquarePlus } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import './styles.css'
import AddGroupDialog from '@/components/AddGroupDialog'
import { Group } from '@/lib/types'
import RenameGroupDialog from '@/components/RenameGroupDialog'
import DeleteGroupDialog from '@/components/DeleteGroupDialog'

const groups = [
  {
    id: 1,
    label: 'Assets',
    children: [
      {
        id: 11,
        label: 'Fixed Assets',
      },
      {
        id: 12,
        label: 'Investments',
      },
      {
        id: 13,
        label: 'Branch/divisions',
      },
      {
        id: 14,
        label: 'Deposits (assets)',
      },
      {
        id: 15,
        label: 'Advances (assets)',
      },
      {
        id: 16,
        label: 'Cash in hand',
      },
      {
        id: 17,
        label: 'Bank accounts',
      },
    ],
  },
  {
    id: 2,
    label: 'Liabilities',
    children: [
      {
        id: 21,
        label: 'Capital account',
      },
      {
        id: 22,
        label: 'Long term loans',
        children: [
          {
            id: 221,
            label: 'Mortgages',
          },
        ],
      },
      {
        id: 23,
        label: 'Current liabilities',
      },
      {
        id: 24,
        label: 'Reserves and surplus',
      },
    ],
  },
  {
    id: 3,
    label: 'Income',
    children: [
      {
        id: 31,
        label: 'Sales account',
      },
    ],
  },
  {
    id: 4,
    label: 'Expenses',
    children: [],
  },
] as Group[]

const getGroupById = (id: number, groups: Group[]): Group | null => {
  for (const group of groups) {
    if (group.id === id) {
      return group // Return label if id matches
    }

    if (group.children) {
      const result = getGroupById(id, group.children) // Recursively check children
      if (result) return result // Return the label from children if found
    }
  }
  return null // Return null if id not found
}

let clickTime = 0

const ManageAccountGroups = () => {
  const [error, setError] = useState<string>('')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [openDialog, setOpenDialog] = useState<
    'add' | 'rename' | 'delete' | null
  >(null)

  const handleContextMenu = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    itemId: string,
  ) => {
    // e.preventDefault()
    // e.stopPropagation()
    if (new Date().getTime() - clickTime < 300) {
      return
    }
    console.log(e.currentTarget.dataset.id)
    setSelectedItemId(Number.parseInt(itemId)) // Set the selected item id
    clickTime = new Date().getTime()
  }

  const handleMenuAction = (action: string) => {
    console.log(`${action} for item ${selectedItemId}`)
    setSelectedItemId(null) // Reset selected item id after action
  }

  const currentGroup = useMemo(
    () => getGroupById(selectedItemId!, groups),
    [selectedItemId],
  )

  return (
    <DashboardPage>
      <Heading>Custom Account Groups Form</Heading>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
      <ContextMenu.Root>
        <Card my='5'>
          <ContextMenu.Trigger>
            <RichTreeView
              defaultExpandedItems={['grid']}
              slots={{
                expandIcon: SquarePlus,
                collapseIcon: SquareMinus,
                endIcon: Square,
                item: (props: unknown) => (
                  // @ts-expect-error MUI props
                  <TreeItem
                    // @ts-expect-error MUI props
                    {...props}
                    // @ts-expect-error MUI props
                    data-id={props.itemId}
                    onContextMenu={(e) =>
                      // @ts-expect-error MUI props
                      handleContextMenu(e, props.itemId as string)
                    }
                  />
                ),
              }}
              items={groups}
            />
          </ContextMenu.Trigger>
        </Card>

        <ContextMenu.Content className='!rounded-sm'>
          <ContextMenu.Item
            className='!rounded-sm'
            onClick={() => setOpenDialog('rename')}
          >
            Rename
          </ContextMenu.Item>

          <ContextMenu.Item
            className='!rounded-sm'
            onClick={() => setOpenDialog('add')}
          >
            Add Group
          </ContextMenu.Item>
          <ContextMenu.Item
            className='!rounded-sm'
            onClick={() => setOpenDialog('delete')}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
      {currentGroup && (
        <>
          <AddGroupDialog
            isOpen={openDialog === 'add'}
            onClose={() => setOpenDialog(null)}
            group={currentGroup}
          />
          <RenameGroupDialog
            isOpen={openDialog === 'rename'}
            onClose={() => setOpenDialog(null)}
            group={currentGroup}
          />
          <DeleteGroupDialog
            isOpen={openDialog === 'delete'}
            onClose={() => setOpenDialog(null)}
            group={currentGroup}
          />
        </>
      )}
    </DashboardPage>
  )
}

export default ManageAccountGroups
