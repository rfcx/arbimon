import fs from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, test } from 'vitest'

import { getSequelizeForTests } from '@/_tests'
import { ModelRepository } from '@/dao/model-repository'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
const PATH_TO_MODELS = './models'
const MODEL_NAME_CONST_PREFIX = 'MODEL_'

const getModelNames = async (): Promise<string[]> => {
  const modelDirPath = resolve(CURRENT_DIR, PATH_TO_MODELS)

  const filenames = await fs.readdir(modelDirPath)
  const modelFilenames = filenames
    .filter(filename => filename.endsWith('-model.ts'))
    .map(filename => `${PATH_TO_MODELS}/${filename.replace('.ts', '')}`)

  const modelExports = await Promise.all(modelFilenames.map(async filename => await import(filename)))
  const foundModelNames = modelExports
    .flatMap(modelExport =>
      Object.entries(modelExport)
        .filter(([k, _v]) => k.startsWith(MODEL_NAME_CONST_PREFIX))
        .map(([_k, v]) => v as string)
    )

  return foundModelNames
}

describe('model repository', () => {
  test('model repository can be constructed', async () => {
    // Act
    const models = ModelRepository.getInstance(getSequelizeForTests())

    // Assert
    expect(models).toBeDefined()
  })

  test('model repository contains all models', async () => {
    // Arrange
    const modelNames = await getModelNames()
    const models = ModelRepository.getInstance(getSequelizeForTests())

    // Assert
    expect(modelNames.length, 'Pre-condition failed (no models found)').toBeGreaterThan(0)
    modelNames.forEach(modelName =>
      expect(models, `${modelName} was not registered`).toHaveProperty(modelName)
    )
  })

  test.todo('models are in sync with migrations', async () => {
    // Arrange
    // get a list of models

    // Act
    // exec sync

    // Assert
    // assert no requested changes
  })
})
