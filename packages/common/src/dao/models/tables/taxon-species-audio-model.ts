import { DataTypes } from 'sequelize'

import { defineWithDefaults } from '../../model-helpers/defaults'
import { TaxonSpeciesAudio } from '../../types'

export const MODEL_TAXON_SPECIES_AUDIO = 'TaxonSpeciesAudio'
export const TABLE_TAXON_SPECIES_AUDIO = 'taxon_species_audio'

export const TaxonSpeciesAudioModel = defineWithDefaults<TaxonSpeciesAudio>(
  MODEL_TAXON_SPECIES_AUDIO,
  {
    // PK
    taxonSpeciesId: {
      type: DataTypes.INTEGER, // 1
      primaryKey: true
    },
    order: {
      type: DataTypes.INTEGER, // 1
      primaryKey: true
    },

    // FKs
    recordingProjectId: DataTypes.INTEGER, // ???
    recordingSiteId: DataTypes.INTEGER, // ???

    // Facts
    sourceUrl: DataTypes.STRING(255), // https://arbimon.rfcx.org/project/puerto-rico-island-wide/visualizer/rec/31437184
    audioUrl: DataTypes.STRING(255), // https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_fwav.wav
    spectrogramUrl: DataTypes.STRING(255), // https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_d512.512_mtrue_fspec.png
    songType: DataTypes.STRING(255), // Common Song
    recordedAt: DataTypes.DATE, // 2021-04-18T11:25:02.517Z (as a date)
    timezone: DataTypes.STRING(255) // America/Puerto_Rico
  },
  {
    tableName: TABLE_TAXON_SPECIES_AUDIO
  }
)
