export const truncateEllipsis = (str: string, maxLength: number): string =>
  str.length > maxLength ? str.substring(0, maxLength - 1) + '…' : str

export const memberName = (firstName: string, lastName: string): string => firstName === '' && lastName === '' ? 'unknown' : `${firstName} ${lastName}`
