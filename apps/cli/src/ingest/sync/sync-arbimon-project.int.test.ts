import { describe, test } from 'vitest'

describe('ingest > sync', () => {
  describe('syncArbimonProjectsBatch', () => {
    test.todo('can sync projects', async () => {
      // Arrange

      // Act

      // Assert
      // TODO: Assert valid projects are in Bio projects table
    })

    test.todo('can sync projects when some invalid', async () => {
      // Arrange

      // Act

      // Assert
      // TODO: Assert valid projects are in Bio projects table
      // TODO: Assert invalid projects are in Bio sync_error table
    })

    test.todo('sync is idempotent', async () => {
      // Arrange

      // Act
      // TODO: Run the same batch twice

      // Assert
      // TODO: Assert result is the same as if we ran sync once
    })

    test.todo('updates sync status with last ID and updatedAt', async () => { })
    test.todo('returns sync status (to support immediately looping)', async () => { })
  })

  describe('syncArbimonProjects', () => {
    test.todo('can sync all projects', async () => { })
    test.todo('can sync all projects when some invalid', async () => { })
  })

  describe('syncArbimonProjectsByIds', () => {
    test.todo('can sync valid projects', async () => { })
    test.todo('can sync invalid projects', async () => { })
    test.todo('removes sync errors on successful sync', async () => { })
  })

  describe('syncArbimonProjectsThatFailed', () => {
    test.todo('can sync valid projects', async () => { })
  })
})
