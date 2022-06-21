import { createTestingPinia } from '@pinia/testing'
import { render, RenderResult } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import Component from './date-picker.vue'

describe('DatePicker', () => {
  const renderWithPinia = (): RenderResult => render(Component, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })]
    }
  })

  test('has date input', async () => {
    // Arrange
    const { getAllByRole } = renderWithPinia()

    // Act
    const dateInputs = getAllByRole('input', { className: /el-range-input/i })

    // Assert
    expect(dateInputs[0]).toBeDefined()
    expect(dateInputs[1]).toBeDefined()
  })

  test.todo('emit date range when start date changed', async () => {
    const wrapper = mount(Component, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('increment')
  })

  test.todo('emit date range when end date changed')
})
