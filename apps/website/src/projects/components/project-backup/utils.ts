export const hasExpired = (date: Date): boolean => {
  return date < new Date()
}
