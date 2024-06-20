import dayjs from 'dayjs'

const formattedDate = (date: Date, includedTime = false): string => {
  return dayjs(date).format(`YYYY-MM-DD ${includedTime ? 'HH:mm' : ''}`)
}

export const hasExpired = (date: Date): boolean => {
  return dayjs(formattedDate(date, true)).isSameOrBefore(dayjs())
}
