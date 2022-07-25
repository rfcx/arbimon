export const isValidQueryHours = (rawQueryHour: string): boolean => {
  return /^(\b(0?[0-9]|1[0-9]|2[0-3])\b)(((-|,)\b(0?[0-9]|1[0-9]|2[0-3])\b)?)+$/g.test(rawQueryHour)
}
