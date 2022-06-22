import { cleanup, fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, test } from 'vitest'

import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './time-of-day-picker.vue'

describe('TimeOfDayPicker', () => {
  afterEach(() => {
    cleanup()
  })

  test('has all, dirunal, nocturnal options', async () => {
    // Arrange
    const { getByRole } = render(component, DEFAULT_RENDER_OPTIONS)

    // Act
    const buttonAll = getByRole('button', { name: /all/i })
    const buttonDiurnal = getByRole('button', { name: /diurnal/i })
    const buttonNocturnal = getByRole('button', { name: /nocturnal/i })

    // Assert
    expect(buttonAll).toBeDefined()
    expect(buttonAll.textContent).toMatch(/all/i)

    expect(buttonDiurnal).toBeDefined()
    expect(buttonDiurnal.textContent).toMatch(/diurnal/i)

    expect(buttonNocturnal).toBeDefined()
    expect(buttonNocturnal.textContent).toMatch(/nocturnal/i)
  })

  test('emits null when "all" clicked', async () => {
    // Arrange
    const eventName = 'emitSelectTime'
    const expected = null

    const { getByRole, emitted } = render(component, DEFAULT_RENDER_OPTIONS)

    const button = getByRole('button', { name: /all/i })

    // Act
    await fireEvent.click(button)

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(eventName)

    const firstEmit = (events[eventName][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit).toEqual(expected)
  })

  test('emits 6-17 when "diurnal" clicked', async () => {
    // Arrange
    const eventName = 'emitSelectTime'
    const expected = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

    const { getByRole, emitted } = render(component, DEFAULT_RENDER_OPTIONS)

    const button = getByRole('button', { name: /diurnal/i })

    // Act
    await fireEvent.click(button)

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(eventName)

    const firstEmit = (events[eventName][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit.sort((a, b) => a - b)).toEqual(expected)
  })

  test('emits 18-5 when "nocturnal" clicked', async () => {
    // Arrange
    const eventName = 'emitSelectTime'
    const expected = [0, 1, 2, 3, 4, 5, 18, 19, 20, 21, 22, 23]

    const { getByRole, emitted } = render(component, DEFAULT_RENDER_OPTIONS)

    const button = getByRole('button', { name: /nocturnal/i })

    // Act
    await fireEvent.click(button)

    // Assert
    const events = emitted()
    expect(events).toHaveProperty(eventName)

    const firstEmit = (events[eventName][0] as number[][])[0]
    expect(firstEmit).toBeDefined()
    expect(firstEmit.sort((a, b) => a - b)).toEqual(expected)
  })
})
