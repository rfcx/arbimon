import { render } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'

import { DEFAULT_RENDER_OPTIONS } from '@/_testing/default-render-options'
import component from './time-of-day-picker.vue'

describe('TimeOfDayPicker', () => {
  test('has all, dirunal, nocturnal options', async () => {
    // Arrange
    const { getByRole } = render(component, DEFAULT_RENDER_OPTIONS)

    // Act
    const buttonAll = getByRole('button', { name: /all/i })
    const buttonDiurnal = getByRole('button', { name: /diurnal/i })
    const buttonNocturnal = getByRole('button', { name: /nocturnal/i })

    // Assert
    expect(buttonAll).toBeDefined()
    expect(buttonDiurnal).toBeDefined()
    expect(buttonNocturnal).toBeDefined()
  })
})
