import { cleanup, fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, test } from 'vitest'

import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './time-of-day-picker.vue'

const emits = {
  emitSelectTime: 'emitSelectTime'
}

describe('TimeOfDayPicker', () => {
  afterEach(() => {
    cleanup()
  })

  test('has all, dirunal, nocturnal options', async () => {
    // Arrange
    const { getByRole } = render(component, DEFAULT_RENDER_OPTIONS)

    // Act
    const buttonAll = getByRole('searchbox', { name: /all/i })
    const buttonDiurnal = getByRole('searchbox', { name: /diurnal/i })
    const buttonNocturnal = getByRole('searchbox', { name: /nocturnal/i })

    // Assert
    expect(buttonAll).toBeDefined()
    expect((buttonAll as HTMLInputElement).value).toMatch(/all/i)

    expect(buttonDiurnal).toBeDefined()
    expect((buttonDiurnal as HTMLInputElement).value).toMatch(/diurnal/i)

    expect(buttonNocturnal).toBeDefined()
    expect((buttonNocturnal as HTMLInputElement).value).toMatch(/nocturnal/i)
  })

  test.todo('emits null when "all" clicked', async () => {
    // Arrange
    const expected = null
    const { getByRole, emitted } = render(component, DEFAULT_RENDER_OPTIONS)
    const button = getByRole('searchbox', { name: /all/i })

    // Act
    await fireEvent.click(button)

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(emits.emitSelectTime)

    const firstEmit = (events[emits.emitSelectTime][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit).toEqual(expected)
  })

  test.todo('emits 6-17 when "diurnal" clicked', async () => {
    // Arrange
    const expected = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
    const { getByRole, emitted } = render(component, DEFAULT_RENDER_OPTIONS)
    const button = getByRole('searchbox', { name: /diurnal/i })

    // Act
    await fireEvent.click(button)

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(emits.emitSelectTime)

    const firstEmit = (events[emits.emitSelectTime][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit.sort((a, b) => a - b)).toEqual(expected)
  })

  test.todo('emits 18-5 when "nocturnal" clicked', async () => {
    // Arrange
    const expected = [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23]
    const { getByRole, emitted } = render(component, DEFAULT_RENDER_OPTIONS)
    const button = getByRole('searchbox', { name: /nocturnal/i })

    // Act
    await fireEvent.click(button)

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(emits.emitSelectTime)

    const firstEmit = (events[emits.emitSelectTime][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit.sort((a, b) => a - b)).toEqual(expected)
  })
})
