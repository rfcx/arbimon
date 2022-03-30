import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { Dayjs } from '@/../../../packages/utils/node_modules/dayjs'

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

const formatDateRange = (start: DateParam, end: DateParam): string => {
  const newStartDate = asDayJs(start)
  const newEndDate = asDayJs(end)
  if (!newStartDate || !newEndDate) return ''

  return `${formatDate(start)} - ${formatDate(end)}`
}

const useDateFormat = () => <const>({
  asDayJs,
  formatDate,
  formatDateFull,
  formatDateRange
})

export default useDateFormat
