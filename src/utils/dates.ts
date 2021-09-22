import dayjs from 'dayjs'

export const formatDateRange = (start: dayjs.Dayjs, end: dayjs.Dayjs): string => {
  if (start.year() !== end.year()) return start.format('MMM DD, YYYY') + ' - ' + end.format('MMM DD, YYYY')
  if (start.month() !== end.month()) return start.format('MMM DD') + ' - ' + end.format('MMM DD, YYYY')
  if (start.date() !== end.date()) return start.format('MMM DD') + ' - ' + end.format('DD, YYYY')
  return start.format('MMM DD, YYYY')
}
