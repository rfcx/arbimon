import { ref } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

type DateParam = string | Date | undefined

// const dayjsDateWithFormat = (date: Date | string, pattern: string): string => {
//   return dayjs(date).format(pattern)
// }

export default function useDateFormat (): {
  formatDate: (dateInput: DateParam, pattern: string) => string
  formatFullDate: (dateInput: DateParam, pattern?: string) => string
  formatDateRange: (start: DateParam, end: DateParam) => string
} {
  const formatDate = (dateInput: DateParam, pattern: string = 'MMMM D, YYYY'): string => {
    const dateInputRef = ref(dateInput)
    if (dateInputRef.value === undefined) return ''
    if (typeof dateInputRef.value === 'string') {
      if (dateInputRef.value?.length === 0) return ''

      return dayjs(dateInputRef.value).format(pattern)
    }
    return formatDate(dateInputRef.value.toISOString())
  }

  const formatDateRange = (start: DateParam, end: DateParam): string => {
    if (start === undefined || end === undefined) return ''
    if (typeof start === 'string' && start.length === 0) return ''
    if (typeof end === 'string' && end.length === 0) return ''

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
