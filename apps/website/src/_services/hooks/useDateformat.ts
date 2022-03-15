import { ref } from 'vue'

import dayjs from '@rfcx-bio/common/node_modules/dayjs'

type DateParam = string | Date | undefined

const dayjsDateWithFormat = (date: Date, pattern: string): string => {
  return dayjs(date).format(pattern)
}

export default function useDateFormat (): {
  formateDate: (dateInput: DateParam, pattern: string) => string
  formatFullDate: (dateInput: DateParam) => string
  startToEndDate: (start: DateParam, end: DateParam) => string
} {
  const formateDate = (dateInput: DateParam, pattern: string = 'MMMM D, YYYY'): string => {
    const dateInputRef = ref(dateInput)
    if (dateInputRef.value === undefined) return ''
    if (typeof dateInputRef.value === 'string') {
      if (dateInputRef.value?.length === 0) return ''
      const date = new Date(dateInputRef.value)

      return dayjsDateWithFormat(date, pattern)
    }
    return formateDate(dateInputRef.value.toISOString())
  }

  const startToEndDate = (start: DateParam, end: DateParam): string => {
    if (start === undefined || end === undefined) return ''
    if (typeof start === 'string' && typeof end === 'string') {
      if (start.length === 0 || end.length === 0) return ''
    }
    return `${formateDate(start)} - ${formateDate(end)}`
  }

  const formatFullDate = (dateInput: DateParam): string => {
    return formateDate(dateInput, 'LLL [(]zzz[)]')
  }

  return {
    formateDate,
    formatFullDate,
    startToEndDate
  }
}
