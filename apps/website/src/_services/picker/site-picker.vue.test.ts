import { render } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './site-picker.vue'

describe('SitePicker', () => {
  const Component = mount(component, DEFAULT_RENDER_OPTIONS)

  test.todo('has all option', async () => {
    // Arrange
    const { getByText } = render(Component)

    // Act
    const allElement = getByText(/all/i)

    // Assert
    expect(allElement).toBeDefined()
  })
})
