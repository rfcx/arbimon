import { ref } from 'vue'

import dayjs from '@rfcx-bio/common/node_modules/dayjs'

export default function useDateFormat (): {
  formateDate: (date: string | Date | undefined) => string
  startToEndDate: (start: string | Date | undefined, end: string | Date | undefined) => string } {
  const formateDate = (dateInput: string | Date | undefined): string => {
    const dateInputRef = ref(dateInput)
    if (dateInputRef.value === undefined) return ''
    if (typeof dateInputRef.value === 'string') {
      if (dateInputRef.value?.length === 0) return ''
      const date = new Date(dateInputRef.value)

      return dayjs(date).format('MMMM D, YYYY')
    }
    return formateDate(dateInputRef.value.toISOString())
  }

  const startToEndDate = (start: string | Date | undefined, end: string | Date | undefined): string => {
    if (start === undefined || end === undefined) return ''
    if (typeof start === 'string' && typeof end === 'string') {
      if (start.length === 0 || end.length === 0) return ''
    }
    return `${formateDate(start)} - ${formateDate(end)}`
  }

  return {
    formateDate,
    startToEndDate
  }
}
