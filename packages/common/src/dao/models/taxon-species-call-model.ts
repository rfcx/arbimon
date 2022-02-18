import { DataTypes } from 'sequelize'

import { TaxonSpeciesCall } from '../../dao/types/taxon-species-call'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'

export const MODEL_TAXON_SPECIES_CALL = 'TaxonSpeciesCall'
export const TABLE_TAXON_SPECIES_CALL = 'taxon_species_call'

export const TaxonSpeciesCallModel = defineWithDefaultsAutoPk<TaxonSpeciesCall>(
  MODEL_TAXON_SPECIES_CALL,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Dimensions
    taxonSpeciesId: DataTypes.INTEGER, // 1
    callProjectId: DataTypes.INTEGER, // ???
    callSiteId: DataTypes.INTEGER, // ???

    // Facts
    callType: DataTypes.STRING(255), // Common Song
    callRecordedAt: DataTypes.DATE, // 2021-04-18T11:25:02.517Z (as a date)
    callTimezone: DataTypes.STRING(255), // America/Puerto_Rico
    callMediaWavUrl: DataTypes.STRING(255), // https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_fwav.wav
    callMediaSpecUrl: DataTypes.STRING(255), // https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_d512.512_mtrue_fspec.png
    callMediaRedirectUrl: DataTypes.STRING(255) // https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31437184
  },
  {
    tableName: TABLE_TAXON_SPECIES_CALL
  }
)
