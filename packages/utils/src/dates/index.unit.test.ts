import { describe, expect, test } from 'vitest'

import { dayjs } from '../dayjs-initialized'
import { formatDateRange } from './index'

describe('formatDateRange', () => {
  const examples = [
    ['2021-09-14T00:00:00.000Z', '2021-09-14T00:00:00.000Z', 'Sep 14, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-09-21T00:00:00.000Z', 'Sep 14 - 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-10-21T00:00:00.000Z', 'Sep 14 - Oct 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2022-10-21T00:00:00.000Z', 'Sep 14, 2021 - Oct 21, 2022']
  ]

  test('can format different days, months, years', () => {
    examples.forEach(([start, end, expected]) => {
      expect(formatDateRange(dayjs(start), dayjs(end))).toEqual(expected)
    })
  })
})
