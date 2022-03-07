export default function useDateFormate (): { formateDate: (date: string | Date) => string } {
  const formateDate = (dateInput: string | Date): string => {
    if (typeof dateInput === 'string') {
      const date = new Date(dateInput)
      const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const monthString = month[date.getMonth()]
      return `${monthString} ${date.getDate()}, ${date.getFullYear()} `
    }
    return dateInput.toUTCString()
  }

  return {
    formateDate
  }
}
