import { cleanup, render } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, test } from 'vitest'

import { type Dayjs } from '@/../../../packages/utils/node_modules/dayjs'
import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './date-picker.vue'

describe('DatePicker', () => {
  afterEach(() => {
    cleanup()
  })

  test.todo('has date input', async () => {
    // Arrange
    const { getAllByRole } = render(component, DEFAULT_RENDER_OPTIONS)

    // Act
    const dateInputs = getAllByRole('searchbox', { name: '' })

    // Assert
    expect(dateInputs[0]).toBeDefined()
    expect(dateInputs[1]).toBeDefined()
  })

  test.todo('emit date range when start date changed', async () => {
    // Arrange
    const wrapper = mount(component, DEFAULT_RENDER_OPTIONS)

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
