
import dayjs from 'dayjs'

import { formatDateRange } from './dates'

describe('formatDateRange: different days, months, years', () => {
  const examples = [
    ['2021-09-14T00:00:00.000Z', '2021-09-14T00:00:00.000Z', 'Sep 14, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-09-21T00:00:00.000Z', 'Sep 14 - 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-10-21T00:00:00.000Z', 'Sep 14 - Oct 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2022-10-21T00:00:00.000Z', 'Sep 14, 2021 - Oct 21, 2022']
  ]

  test.each(examples)('%s, %s', (start, end, expected) => {
    expect(formatDateRange(dayjs(start), dayjs(end))).toEqual(expected)
  })
})
