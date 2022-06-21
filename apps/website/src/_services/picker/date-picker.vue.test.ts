import { createTestingPinia } from '@pinia/testing'
import { render, RenderResult } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import { Dayjs } from '@/../../../packages/utils/node_modules/dayjs'
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
    const dateInputs = getAllByRole('searchbox', { name: '' })

    // Assert
    expect(dateInputs[0]).toBeDefined()
    expect(dateInputs[1]).toBeDefined()
  })

  test('emit date range when start date changed', async () => {
    // Arrange
    const wrapper = mount(Component, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })

    // Act
    // await wrapper.find('button').trigger('click')
    // await wrapper.find('button').trigger('click')

    // Assert
    const emitted = wrapper.emitted()
    expect(emitted).toHaveProperty('dateRangeSelected')

    const firstEmit = (emitted.dateRangeSelected[0] as Array<[Dayjs, Dayjs]>)[0]
    expect(firstEmit[0]).toBeDefined()
    expect(firstEmit[1]).toBeDefined()
  })

  test.todo('emit date range when end date changed')
})
