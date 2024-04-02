import { describe, expect, test } from 'vitest'

import { SortCondition } from './index'

describe('SortCondition class', () => {
  test('correctly parses the condition class', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      }
    ])
  })

  test('when other signs are given, include the sign in the column name', () => {
    // Arrange
    const input = 'name,-unvalidated,+who'

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      },
      {
        name: '+who',
        ordering: 'asc'
      }
    ])
  })

  test('consecutive negative signs gets converted to descending sort with negative sign in column name', () => {
    // Arrange
    const input = 'name,-unvalidated,--doublenegative'

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      },
      {
        name: '-doublenegative',
        ordering: 'desc'
      }
    ])
  })

  test('when empty string/consecutive commas are given, it gets filtered out', () => {
    // Arrange
    const input = 'name,,,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      }
    ])
  })

  test('spaces inside column name will get preserved', () => {
    // Arrange
    const input = 'Na me,-unvali dated '

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'Na me',
        ordering: 'asc'
      },
      {
        name: 'unvali dated',
        ordering: 'desc'
      }
    ])
  })

  test('spaces in front/at the back of each criteria will get removed', () => {
    // Arrange
    const input = '   name,   -unvalidated   '

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      }
    ])
  })

  test('when total empty strings are given, you get a class with empty values', () => {
    // Arrange
    const input = ''

    // Act
    const sortCondition = new SortCondition(input)

    // Assert
    expect(sortCondition.getValues()).toHaveLength(0)
  })

  test('SortCondition#get method correctly gets the correct method and index', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const condition = sortCondition.get(0)

    // Assert
    expect(condition).toEqual({ name: 'name', ordering: 'asc' })
  })

  test('SortCondition#get returns undefined when index are out of bounds', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const condition = sortCondition.get(100)

    // Assert
    expect(condition).toEqual(undefined)
  })

  test('SortCondition#isEmpty correctly provides the correct value', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const emptySortCondition = new SortCondition('')

    // Assert
    expect(sortCondition.isEmpty()).toEqual(false)
    expect(emptySortCondition.isEmpty()).toEqual(true)
  })

  test('SortCondition#rename returns false when given name does not match any existing name', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const renameSuccess = sortCondition.rename('whodis', 'nowhere')

    // Assert
    expect(renameSuccess).toEqual(false)
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      }
    ])
  })

  test('SortCondition#rename returns true when the oldName exists', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const renameSuccess = sortCondition.rename('name', 'who')

    // Assert
    expect(renameSuccess).toEqual(true)
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'who',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      }
    ])
  })

  test('SortCondition#rename can correctly renames to uppercase or new name with spaces', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const renameSuccess = sortCondition.rename('name', 'W H O')

    // Assert
    expect(renameSuccess).toEqual(true)
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'W H O',
        ordering: 'asc'
      },
      {
        name: 'unvalidated',
        ordering: 'desc'
      }
    ])
  })

  test('SortCondition#toString correct returns the string as same as the given input', () => {
    // Arrange
    const input = 'name,-unvalidated'

    // Act
    const sortCondition = new SortCondition(input)
    const output = sortCondition.toString()

    // Assert
    expect(input).toEqual(output)
  })

  test('SortCondition#keep keeps the given keys and remove other keys out', () => {
    // Arrange
    const input = 'name,-unvalidated,notPresent'

    // Act
    const sortCondition = new SortCondition(input)
    sortCondition.keep(['name', 'notPresent'])

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'notPresent',
        ordering: 'asc'
      }
    ])
  })

  test('SortCondition#keep when given keys that does not exist in the list, just skip', () => {
    // Arrange
    const input = 'name,-unvalidated,notPresent'

    // Act
    const sortCondition = new SortCondition(input)
    sortCondition.keep(['name', 'notPresent', 'who'])

    // Assert
    expect(sortCondition.getValues()).toEqual([
      {
        name: 'name',
        ordering: 'asc'
      },
      {
        name: 'notPresent',
        ordering: 'asc'
      }
    ])
  })

  test('when SortCondition#keep is given an empty array, all the items gets removed', () => {
    // Arrange
    const input = 'name,-unvalidated,notPresent'

    // Act
    const sortCondition = new SortCondition(input)
    sortCondition.keep([])

    // Assert
    expect(sortCondition.getValues()).toHaveLength(0)
  })
})
