import { createTestingPinia } from '@pinia/testing'
import { render } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import ComponentRaw from './site-picker.vue'

describe('SitePicker', () => {
  const Component = mount(ComponentRaw, {
    global: {
      plugins: [createTestingPinia({
        createSpy: vi.fn
      })]
    }
  })

  test.todo('has all option', async () => {
    // Arrange
    const { getByText } = render(Component)

    // Act
    const allElement = getByText(/all/i)

    // Assert
    expect(allElement).toBeDefined()
  })
})
