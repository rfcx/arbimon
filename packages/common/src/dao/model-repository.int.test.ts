import fs from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, test } from 'vitest'

import { getSequelizeForTests } from '@/_tests'
import { ModelRepository } from '@/dao/model-repository'

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url))
const PATH_TO_MODELS = ['./models-cache', './models-table', './models-view']
const MODEL_NAME_CONST_PREFIX = 'MODEL_'

const modelNamesForFolder = async (folderPath: string): Promise<string[]> => {
  const filenames = await fs.readdir(folderPath)

  const modelPaths = filenames
    .filter(filename => filename.endsWith('-model.ts'))
    .map(filename => `${folderPath}/${filename.slice(0, filename.lastIndexOf('.ts'))}`)

  const modelExports: Array<Record<string, unknown>> = await Promise.all(modelPaths.map(async path => await import(path)))

  const modelNames = modelExports.flatMap(modelExport => Object.entries(modelExport)
    .filter(([k, _v]) => k.startsWith(MODEL_NAME_CONST_PREFIX))
    .map(([_k, v]) => v as string))

  return modelNames
}

const getModelNames = async (): Promise<string[]> =>
  await Promise.all(PATH_TO_MODELS.map(async path => await modelNamesForFolder(resolve(CURRENT_DIR, path))))
    .then(lists => lists.flat())

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
