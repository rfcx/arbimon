export function arrayFromQuery (value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return [value]
  return []
}
