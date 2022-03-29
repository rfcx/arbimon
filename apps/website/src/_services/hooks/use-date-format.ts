import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

type DateParam = string | Date | undefined

// const dayjsDateWithFormat = (date: Date | string, pattern: string): string => {
//   return dayjs(date).format(pattern)
// }

export default function useDateFormat (): {
  formatDate: (dateInput: DateParam, pattern?: string) => string
  formatFullDate: (dateInput: DateParam, pattern?: string) => string
  formatDateRange: (start: DateParam, end: DateParam) => string
} {
  const formatDate = (dateInput: DateParam, pattern: string = 'MMMM D, YYYY'): string => {
    if (dateInput === undefined) return ''
    if (typeof dateInput === 'string') {
      if (dateInput?.length === 0) return ''

      return dayjs(dateInput).format(pattern)
    }
    if (!dayjs(dateInput).isValid()) return ''

    return formatDate(dateInput.toISOString())
  }

  const formatDateRange = (start: DateParam, end: DateParam): string => {
    const newStartDate = dayjs(start).isValid()
    const newEndDate = dayjs(end).isValid()

    if (!newStartDate || !newEndDate) return ''

    return `${formatDate(start)} - ${formatDate(end)}`
  }

  const formatFullDate = (dateInput: DateParam): string => {
    return formatDate(dateInput, 'LLL (z)')
  }

  return {
    formatDate,
    formatFullDate,
    formatDateRange
  }
}
