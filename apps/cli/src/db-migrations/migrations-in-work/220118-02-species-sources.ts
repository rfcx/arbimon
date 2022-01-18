import { DataTypes, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const TABLE_NAMES = {
  IUCN: 'taxon_species_source_iucn',
  RFCX: 'taxon_species_source_rfcx',
  WIKI: 'taxon_species_source_wiki'
}

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.createTable(TABLE_NAMES.IUCN, {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true
      // autoIncrement: true
    }
    /** DIMENSIONS **/
    /** FACTS **/
  })

  await params.context.createTable(TABLE_NAMES.RFCX, {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }
    /** DIMENSIONS **/
    /** FACTS **/
  })

  await params.context.createTable(TABLE_NAMES.WIKI, {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }
    /** DIMENSIONS **/
    /** FACTS **/
  })
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await Promise.all(Object.values(TABLE_NAMES).map(async tableName => await params.context.dropTable(tableName)))
