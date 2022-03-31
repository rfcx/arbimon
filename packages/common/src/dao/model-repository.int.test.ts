import { describe, expect, test } from 'vitest'

import { getSequelizeForTests } from '@/_tests'
import { ModelRepository } from '@/dao/model-repository'

describe('model repository', () => {
  test('Can construct model repository', async () => {
    // Act
    const models = ModelRepository.getInstance(getSequelizeForTests())

    // Assert
    expect(models).toBeDefined()
  })
})
