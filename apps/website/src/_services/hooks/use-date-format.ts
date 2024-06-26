import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type Dayjs } from '@/../../../packages/utils/node_modules/dayjs'

type DateParam = string | Date | Dayjs | undefined

const asDayJs = (dateInput: DateParam): Dayjs | undefined => {
  if (dateInput === undefined || dateInput === '') return undefined
  if (dayjs.isDayjs(dateInput)) return dateInput
  return dayjs(dateInput)
}

const formatDate = (dateInput: DateParam, pattern: string = 'MMMM D, YYYY'): string =>
  asDayJs(dateInput)?.format(pattern) ?? ''

const formatDateFull = (dateInput: DateParam): string =>
  formatDate(dateInput, 'LLL (z)')

const formatDateLocal = (dateInput: DateParam): string =>
  formatDate(dateInput, 'YYYY-MM-DD HH:mm')

const formatDateRange = (start: DateParam, end: DateParam): string => {
  const newStartDate = asDayJs(start)
  const newEndDate = asDayJs(end)
  if (!newStartDate || !newEndDate) return ''

  return `${formatDate(start)} - ${formatDate(end)}`
}

const useDateFormat = () => ({
  asDayJs,
  formatDate,
  formatDateFull,
  formatDateRange,
  formatDateLocal
}) as const

export default useDateFormat
