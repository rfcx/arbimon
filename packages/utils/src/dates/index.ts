import type { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

import { dayjs } from '../dayjs-initialized'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export const formatDateRange = (start: Dayjs, end: Dayjs): string => {
  if (start.year() !== end.year()) return start.format('MMM DD, YYYY') + ' - ' + end.format('MMM DD, YYYY')
  if (start.month() !== end.month()) return start.format('MMM DD') + ' - ' + end.format('MMM DD, YYYY')
  if (start.date() !== end.date()) return start.format('MMM DD') + ' - ' + end.format('DD, YYYY')
  return start.format('MMM DD, YYYY')
}

export const chunkDates = (start: string, end: string, rangeInDays: number): Array<{ start: string, end: string }> => {
    const results = []
    let startDate = dayjs(start)
    const endDate = dayjs(end)

    while (startDate.isSameOrBefore(endDate)) {
      if (startDate.add(rangeInDays, 'days').isSameOrAfter(endDate)) {
        results.push({
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD')
        })

        break
      } else {
        results.push({
          start: startDate.format('YYYY-MM-DD'),
          end: startDate.add(rangeInDays, 'days').format('YYYY-MM-DD')
        })
      }

      startDate = startDate.add(rangeInDays, 'days')
    }

    return results
}
