export const verifyDateFormError = (startDate: string | undefined, endDate: string | undefined, onGoing: boolean): string => {
  const dateS = startDate ? new Date(startDate) : undefined
  const dateE = onGoing ? null : endDate ? new Date(endDate) : undefined
  // none x none
  if (dateS === undefined && dateE === undefined) return '' // not provided
  // none x date OR date x none
  if ((dateS === undefined && dateE !== undefined) || (dateS !== undefined && dateE === undefined)) return 'Please choose project start and end date'
  // date x null
  if (dateS !== undefined && dateE === null) return '' // on going
  // date x date
  if (dateS !== undefined && dateE !== undefined && dateE !== null) {
    if (dateS > dateE) return 'Project start date should be before end date'
    return '' // valid
  }
  return ''
}
