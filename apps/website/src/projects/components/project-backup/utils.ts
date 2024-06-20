import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrBefore)

export const hasExpired = (date: Date): boolean => {
  return dayjs(date).isSameOrBefore(dayjs())
}
