/**
 * Validates if given sourceQuery is valid ISO format date.
 * @param sourceQuery - string given from query parameter
 * @return ```boolean```
 */
export const isValidDate = (sourceQuery: string): boolean => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(sourceQuery)) return false
  const d = new Date(sourceQuery)
  return d.toISOString() === sourceQuery
}
