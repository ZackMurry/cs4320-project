// Function to build an array that contains a list of groups with their IDs

import { Category, Group, NamedGroup } from './types'

// and their "full names", which include all parent groups and categories
const buildGroupArray = (
  groups: Group[],
  categories: Category[],
): NamedGroup[] => {
  // Map between category ID and category name
  const categoryMap = new Map<number, string>()
  categories.forEach((cat) => {
    categoryMap.set(cat.ID, cat.name)
  })

  // Map between group ID and group name
  const groupMap = new Map<number, Group>()
  groups.forEach((group) => {
    groupMap.set(group.ID, group)
  })

  // Function to get the full name of a group
  const getFullName = (group: Group): string => {
    // List of name components
    const names: string[] = []
    let current: Group | undefined = group

    // While we still have another parent
    while (current) {
      names.unshift(current.name) // Add this parent to the start of the name
      // Set current to the parent
      current =
        current.parentID !== null ? groupMap.get(current.parentID) : undefined
    }

    // Add category to start of name
    const rootCategory = categoryMap.get(group.categoryID)
    if (rootCategory) {
      names.unshift(rootCategory)
    }

    // Convert names to a string
    return names.join(`\\`)
  }

  // Return array of groups with full names
  return groups.map((group) => ({
    id: group.ID,
    fullName: getFullName(group),
  }))
}

export default buildGroupArray
