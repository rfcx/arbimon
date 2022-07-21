/**
 * Validates if given sourceQuery is valid ISO format date or YYYY-MM-DD format date.
 * @param sourceQuery - string or undefined given from query parameter
 * @return ```boolean```
 */
export const isValidDate = (sourceQuery: string | undefined): boolean => {
  if (!sourceQuery || !/\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}.\d{3}Z)?$/.test(sourceQuery)) return false
  const d = new Date(sourceQuery)
  return d.toISOString() === sourceQuery
}
