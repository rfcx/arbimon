import { describe, expect, test } from 'vitest'

import { type LocationProjectProfileContentType } from '@rfcx-bio/node-common/dao/types'

import { sqlValues } from './sql-values'

describe('Generate SQL query for insert or updating the dashboard content (except stakeholders)', () => {
  test('an update to a column with default value (summary, readme) should have both columns after insert clause but only one after an update clause', () => {
    // Arrange
    const contentType: LocationProjectProfileContentType = 'summary'
    const value = 'new summary value'

    // Act
    const output = sqlValues(contentType, value)

    // Assert
    expect(output.keys).toEqual('summary, readme')
    expect(output.values).toEqual('\'new summary value\', \'\'')
    expect(output.updateClause).toEqual('summary = \'new summary value\'')
  })

  test('an update to the column with default value (key_result, methods) the column must exist after insert clause', () => {
    // Arrange
    const contentType: LocationProjectProfileContentType = 'keyResult'
    const value = 'new keyResult value'

    // Act
    const output = sqlValues(contentType, value)

    // Assert
    expect(output.keys).toEqual('summary, readme, key_result')
    expect(output.values).toEqual('\'\', \'\', \'new keyResult value\'')
    expect(output.updateClause).toEqual('key_result = \'new keyResult value\'')
  })
})
