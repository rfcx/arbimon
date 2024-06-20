import dayjs from 'dayjs'

export const hasExpired = (date: Date): boolean => {
  return dayjs(date).isSameOrBefore(dayjs())
}
