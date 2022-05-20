import { DataTypes } from 'sequelize'

import { TaxonSpeciesMerged } from '@/dao/types/views/taxon-species-merged'
import { defineWithDefaults } from '../../model-helpers/defaults'

export const MODEL_TAXON_SPECIES_MERGED = 'TaxonSpeciesMerged'
export const TABLE_TAXON_SPECIES_MERGED = 'taxon_species_merged'

export const TaxonSpeciesMergedModel = defineWithDefaults<TaxonSpeciesMerged>(
  MODEL_TAXON_SPECIES_MERGED,
  {
    // PK
    id: { // 1
      type: DataTypes.INTEGER,
      primaryKey: true
    },

    // SKs
    slug: { // accipiter-striatus-venator
      type: DataTypes.STRING(255),
      unique: true
    },
    scientificName: { // Accipiter striatus venator
      type: DataTypes.STRING(255),
      unique: true
    },

    // FKs
    taxonClassId: DataTypes.INTEGER, // 1
    commonNameSourceId: { // 1
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descriptionSourceId: { // 1
      type: DataTypes.INTEGER,
      allowNull: true
    },
    photoSourceId: { // 1
      type: DataTypes.INTEGER,
      allowNull: true
    },
    riskRatingId: { // 1
      type: DataTypes.INTEGER,
      allowNull: true
    },
    riskRatingSourceId: { // 1
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Facts
    audioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    audioSourceUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    spectrogramUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    commonName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descriptionSourceUrl: {
      type: DataTypes.STRING(511),
      allowNull: true
    },
    photoUrl: {
      type: DataTypes.STRING(511),
      allowNull: true
    },
    photoSourceUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    photoLicense: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    photoCaption: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    photoAuthor: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    riskRatingCustomCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    riskRatingSourceUrl: {
      type: DataTypes.STRING(511),
      allowNull: true
    }
  },
  {
    tableName: TABLE_TAXON_SPECIES_MERGED,
    timestamps: false
  }
)
