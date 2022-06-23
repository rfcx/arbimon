import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, test } from 'vitest'

import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './site-picker.vue'

describe('SitePicker', () => {
  afterEach(() => {
    cleanup()
  })

  test.todo('has all option', async () => {
    // Arrange
    const { getByText } = render(component, DEFAULT_RENDER_OPTIONS)

    // Act
    const allElement = getByText(/all/i)

    // Assert
    expect(allElement).toBeDefined()
  })
})
