export const hasExpired = (date: string): boolean => {
  return new Date(date) < new Date()
}
