import { type LocationProjectProfileContentType } from '@rfcx-bio/node-common/dao/types'

/**
 * Accepts a key and value to add to the create table, this function is used so that when doing an insert on another column we can guarantee that there will be no panics
 * on the column that does not have default value set.
 */
export const sqlValues = (contentType: LocationProjectProfileContentType, value: string): { keys: string, values: string, updateClause: string } => {
  const columnNameMap: Record<LocationProjectProfileContentType, string> = {
    summary: 'summary',
    readme: 'readme',
    keyResult: 'key_result',
    resources: 'resources',
    methods: 'methods'
  }

  // Columns without default value inside the database
  const noDefaultColumnNames: Partial<Record<LocationProjectProfileContentType, string>> = {
    summary: '',
    readme: ''
  }

  noDefaultColumnNames[contentType] = value

  return {
    keys: Object.keys(noDefaultColumnNames).map(k => columnNameMap[k as LocationProjectProfileContentType]).join(', '),
    values: Object.values(noDefaultColumnNames).map(v => `'${v}'`).join(', '),
    updateClause: `${columnNameMap[contentType]} = '${value}'`
  }
}
