import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, test } from 'vitest'

import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './classifier-picker.vue'

describe('ClassifierPicker', () => {
  afterEach(() => {
    cleanup()
  })

  test('emits first available classifier ID', async () => {
    // Arrange
    const eventName = 'selectedClassifier'
    const firstClassifierId = 123
    const { emitted } = render(component, {
      ...DEFAULT_RENDER_OPTIONS,
      props: {
        classifierModels: [
          {
            id: firstClassifierId,
            name: 'Cats of the Indoors',
            version: 12,
            last_executed_at: '2022-01-01T00:00:00.000Z'
          }, {
            id: 456,
            name: 'Lizards of Thailand',
            version: 3,
            last_executed_at: '2021-01-01T00:00:00.000Z'
          }
        ]
      }
    })

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(eventName)

    const firstEmit = (events[eventName][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit).toEqual(firstClassifierId)
  })
})
