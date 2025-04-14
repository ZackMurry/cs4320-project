'use client'

import DashboardPage from '@/components/DashboardPage'
import { RichTreeView, TreeItem } from '@mui/x-tree-view'
import { Card, ContextMenu, Heading } from '@radix-ui/themes'
import { Square, SquareMinus, SquarePlus } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'
import AddGroupDialog from '@/components/AddGroupDialog'
import {
  Category,
  CategoryTree,
  Group,
  GroupTree,
  GroupTreeResponse,
} from '@/lib/types'
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

let clickTime = 0

const ManageAccountGroups = () => {
  const [tree, setTree] = useState<CategoryTree[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string>('')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
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
    setSelectedItemId(itemId)
    clickTime = new Date().getTime()
  }

  const buildTree = (groups: Group[], categories: Category[]) => {
    const nodes: CategoryTree[] = []
    for (const category of categories) {
      nodes.push({
        ...category,
        id: `category-${category.ID}`,
        label: category.name,
        children: [],
      })
    }
    const matched: { [id: number]: GroupTree } = {}
    for (const group of groups) {
      if (group.parentID === null) {
        const catNode = nodes.findLast((n) => n.ID === group.categoryID)
        if (!catNode) {
          console.error('Could not build group tree!')
          continue
        }
        console.log('adding to category', catNode.ID)
        const newNode = {
          ...group,
          id: `group-${group.ID}`,
          label: group.name,
          children: [],
        }
        catNode.children.push(newNode)
        matched[group.ID] = newNode
      }
    }
    // Add groups with parents
    while (Object.keys(matched).length !== groups.length) {
      for (const group of groups) {
        if (matched[group.ID]) {
          continue
        }
        if (!group.parentID) {
          console.error('Could not build group tree!')
          return
        }
        const parentNode = matched[group.parentID]
        if (!parentNode) {
          continue
        }
        const newNode = {
          ...group,
          id: `group-${group.ID}`,
          label: group.name,
          children: [],
        }
        parentNode.children.push(newNode)
        matched[group.ID] = newNode
      }
    }
    setTree(nodes)
  }

  const handleRename = (val: string) => {
    const newGroups = groups.map((g) => {
      if (`group-${g.ID}` === selectedItemId) {
        return {
          ...g,
          name: val,
        }
      } else return g
    })
    buildTree(newGroups, categories)
  }

  const getDescendants = (id: number) => {
    const grs = groups.filter((g) => g.parentID === id).map((g) => g.ID)
    console.log('gr', grs)
    if (!grs) {
      window.location.reload() // Just reload instead of updating
      return []
    }
    for (const c of grs) {
      grs.push(...getDescendants(c))
    }
    return grs
  }

  const handleDelete = () => {
    console.log('delete')
    if (!selectedItemId) {
      window.location.reload()
      return
    }
    const id = Number.parseInt(selectedItemId.substring('group-'.length))
    const children = getDescendants(id)
    console.log('children', children)
    const newGroups = groups.filter(
      (g) => !children.includes(g.ID) && id !== g.ID,
    )
    setGroups(newGroups)
    buildTree(newGroups, categories)
  }

  const handleAdd = (g: Group) => {
    const newGroups = [...groups, g]
    buildTree(newGroups, categories)
    setGroups(newGroups)
  }

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch('/api/v1/groups')
      if (res.ok) {
        const { groups, categories } = (await res.json()) as GroupTreeResponse
        setGroups(groups)
        setCategories(categories)
        buildTree(groups, categories)
      }
    }
    fetchGroups()
  }, [])

  const currentNode = useMemo(() => {
    if (!selectedItemId) {
      return null
    }
    if (selectedItemId.startsWith('group-')) {
      return groups.findLast((g) => `group-${g.ID}` === selectedItemId)
    }
    return categories.findLast((c) => `category-${c.ID}` === selectedItemId)
  }, [selectedItemId, groups, categories])
  console.log(tree)

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
              items={tree}
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
      {currentNode && (
        <>
          <AddGroupDialog
            isOpen={openDialog === 'add'}
            onClose={() => setOpenDialog(null)}
            node={currentNode}
            onError={setError}
            onAdd={handleAdd}
          />
          <RenameGroupDialog
            isOpen={openDialog === 'rename'}
            onClose={() => setOpenDialog(null)}
            node={currentNode}
            onError={setError}
            onRename={handleRename}
          />
          <DeleteGroupDialog
            isOpen={openDialog === 'delete'}
            onClose={() => setOpenDialog(null)}
            node={currentNode}
            onError={setError}
            onDelete={handleDelete}
          />
        </>
      )}
    </DashboardPage>
  )
}

export default ManageAccountGroups
