/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

 import { DataTypes, QueryInterface } from 'sequelize'
 import { MigrationFn } from 'umzug'

 const TABLE_NAME = 'detection_by_site_species_hour'

 export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> => {
  return await Promise.all([
    await params.context.changeColumn(TABLE_NAME, 'duration_minutes', {
      type: DataTypes.ARRAY,
      defaultValue: null
    }),
    await params.context.renameColumn(TABLE_NAME, 'duration_minutes', 'detection_minutes')
  ])
 }
