export default function useDateFormate (): {
  formateDate: (date: string | Date | undefined) => string
  startToEndDate: (start: string | Date | undefined, end: string | Date | undefined) => string} {
  const formateDate = (dateInput: string | Date | undefined): string => {
    if (dateInput === undefined) return ''
    if (typeof dateInput === 'string') {
      if (dateInput.length === 0) return ''
      const date = new Date(dateInput)
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const monthString = month[date.getMonth()]
      return `${monthString} ${date.getDate()}, ${date.getFullYear()} `
    }
    return formateDate(dateInput.toISOString())
  }

  const startToEndDate = (start: string | Date | undefined = '', end: string | Date | undefined = ''): string => {
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
