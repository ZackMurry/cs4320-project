'use client'

import DashboardPage from '@/components/DashboardPage'
import { RichTreeView, TreeItem } from '@mui/x-tree-view'
import { Card, ContextMenu, Heading } from '@radix-ui/themes'
import { Square, SquareMinus, SquarePlus } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'
import AddGroupDialog from '@/components/dialog/AddGroupDialog'
import {
  Category,
  CategoryTree,
  Group,
  GroupTree,
  GroupTreeResponse,
} from '@/lib/types'
import RenameGroupDialog from '@/components/dialog/RenameGroupDialog'
import DeleteGroupDialog from '@/components/dialog/DeleteGroupDialog'

// Last time the context menu was opened
let clickTime = 0

// Page for managing account groups
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
    // Don't open the context menu twice (prevent double-click bugs)
    if (new Date().getTime() - clickTime < 300) {
      return
    }
    setSelectedItemId(itemId) // Set context for current group
    clickTime = new Date().getTime() // Updae clickTime to now
  }

  // Make a tree of groups based on parent IDs
  const buildTree = (groups: Group[], categories: Category[]) => {
    const nodes: CategoryTree[] = []
    // Add all categories to the lsit
    for (const category of categories) {
      nodes.push({
        ...category,
        id: `category-${category.ID}`,
        label: category.name,
        children: [],
      })
    }
    const matched: { [id: number]: GroupTree } = {}
    // Add all top-level groups to the tree
    for (const group of groups) {
      if (group.parentID === null) {
        // Find the group's category
        const catNode = nodes.find((n) => n.ID === group.categoryID)
        if (!catNode) {
          console.error('Could not build group tree!')
          continue
        }
        const newNode = {
          ...group,
          id: `group-${group.ID}`,
          label: group.name,
          children: [],
        }
        // Add the group as the category's child
        catNode.children.push(newNode)
        // Add group to matched list
        matched[group.ID] = newNode
      }
    }
    // Add groups with parents
    // While loop has one iteration per level of tree
    while (Object.keys(matched).length !== groups.length) {
      for (const group of groups) {
        // If this group is already in the tree, skip it
        if (matched[group.ID]) {
          continue
        }
        if (!group.parentID) {
          // If this group is top-level, something went wrong
          setError('Could not build group tree!')
          return
        }
        // Get location of parent in the tree
        const parentNode = matched[group.parentID]
        if (!parentNode) {
          // Parent has not been added yet
          continue
        }
        const newNode = {
          ...group,
          id: `group-${group.ID}`,
          label: group.name,
          children: [],
        }
        // Add this group to its parent's children
        parentNode.children.push(newNode)
        // Store this group in the matched array
        matched[group.ID] = newNode
      }
    }
    setTree(nodes)
  }

  // Update current group's name
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

  // Get descendants of a group with the given ID
  const getDescendants = (id: number) => {
    // Get IDs of direct children
    const grs = groups.filter((g) => g.parentID === id).map((g) => g.ID)
    if (!grs) {
      window.location.reload() // Just reload instead of updating
      return []
    }
    for (const c of grs) {
      // For each child
      grs.push(...getDescendants(c)) // Add all descendants of that child
    }
    return grs
  }

  // Delete the currently selected group
  const handleDelete = () => {
    if (!selectedItemId) {
      window.location.reload()
      return
    }
    const id = Number.parseInt(selectedItemId.substring('group-'.length))
    const children = getDescendants(id)
    const newGroups = groups.filter(
      (g) => !children.includes(g.ID) && id !== g.ID,
    )
    setGroups(newGroups)
    buildTree(newGroups, categories)
  }

  // Add a new group to the tree
  const handleAdd = (g: Group) => {
    const newGroups = [...groups, g]
    buildTree(newGroups, categories) // Update the tree
    setGroups(newGroups)
  }

  // useEffect is run on the first render
  useEffect(() => {
    // Request groups from backend
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

  // Memoize current node based on its ID and type
  const currentNode = useMemo(() => {
    if (!selectedItemId) {
      return null
    }
    if (selectedItemId.startsWith('group-')) {
      return groups.findLast((g) => `group-${g.ID}` === selectedItemId)
    }
    return categories.findLast((c) => `category-${c.ID}` === selectedItemId)
  }, [selectedItemId, groups, categories])

  return (
    <DashboardPage error={error} onCloseError={() => setError('')}>
      <Heading>Custom Account Groups Form</Heading>
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
