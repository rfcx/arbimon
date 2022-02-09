import { DataTypes } from 'sequelize'

import { TaxonSpecies } from '../../dao/types'
import { defineWithDefaultsAutoPk } from '../helpers/defaults'
import { TABLE_TAXON_SPECIES } from '../table-names'

export const TaxonSpeciesModel = defineWithDefaultsAutoPk<TaxonSpecies>(
  'TaxonSpecies',
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // SKs
    idArbimon: DataTypes.INTEGER, // ???
    slug: { // accipiter-striatus-venator
      type: DataTypes.STRING(255),
      unique: true
    },

    // Dimensions
    taxonClassId: DataTypes.INTEGER, // 1

    // Facts
    scientificName: DataTypes.STRING(255), // Accipiter striatus venator
    commonName: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    extinctionRiskRating: DataTypes.STRING(10), // CR
    extinctionRiskRatingSource: DataTypes.STRING(255), // PRDNER 2016

    // Facts - Description
    // TODO: Split as a separate table
    description: DataTypes.TEXT, // ???
    descriptionSource: DataTypes.STRING(255), // ???
    descriptionSourceUrl: DataTypes.STRING(255), // ???

    // Facts - Call
    // TODO: Split as a separate table
    callProjectId: DataTypes.INTEGER, // ???
    callSiteId: DataTypes.INTEGER, // ???
    callType: DataTypes.STRING(255), // Common Song
    callRecordedAt: DataTypes.DATE, // 2021-04-18T11:25:02.517Z (as a date)
    callTimezone: DataTypes.STRING(255), // America/Puerto_Rico
    callMediaWavUrl: DataTypes.STRING(255), // https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_fwav.wav
    callMediaSpecUrl: DataTypes.STRING(255), // https://media-api.rfcx.org/internal/assets/streams/Rq48bGCkR0NG_t20210418T112502517Z.20210418T112506208Z_d512.512_mtrue_fspec.png

    // Facts - Photo
    // TODO: Split as a separate table
    photoUrl: DataTypes.STRING(511), // https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg/268px-Puerto_Rican_Sharp-shinned_hawk_sitting_on_tree_branch.jpg
    photoCaption: DataTypes.STRING(255), // Puerto Rican sharp-shinned hawk
    photoAuthor: DataTypes.STRING(255), // Mike Morel/U. S. Fish and Wildlife Service
    photoLicense: DataTypes.STRING(255), // Public domain
    photoLicenseUrl: DataTypes.STRING(255) // https://www.fws.gov/faq/imagefaq.html
  },
  {
    tableName: TABLE_TAXON_SPECIES
  }
)
