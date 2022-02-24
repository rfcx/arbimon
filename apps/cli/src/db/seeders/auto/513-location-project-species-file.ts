import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { speciesPredictionOccupancyGeneratedUrl } from '@rfcx-bio/common/api-bio/species/species-prediction-occupancy'
import { LocationProjectSpeciesFileModel } from '@rfcx-bio/common/dao/models/location-project-species-file-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { LocationProjectSpeciesFile } from '@rfcx-bio/common/dao/types/location-project-species-file'

import { requireEnv } from '~/env'
import { BioEnvironment } from '~/env/types'
import { rawFilenames } from '../_data/location-project-species-file'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

const baseUrls: Record<BioEnvironment, string> = {
  local: 'http://localhost:3000',
  testing: 'https://testing-bio.rfcx.org/api',
  staging: 'https://staging-bio.rfcx.org/api',
  production: 'https://bio.rfcx.org/api'
}

const baseUrl = baseUrls[BIO_ENVIRONMENT]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const species = await TaxonSpeciesModel(sequelize).findAll({ raw: true })

  // Convert data
  const locationProjectId = 1
  const files: LocationProjectSpeciesFile[] = species
    .flatMap(s => rawFilenames
      .filter(filename => filename.startsWith(s.slug))
      .map((filename, order) => ({
        locationProjectId,
        taxonSpeciesId: s.id,
        description: `Predicted Occupancy Map for ${s.scientificName}`,
        order,
        filename,
        mimeType: 'image/png',
        url: `${baseUrl}${speciesPredictionOccupancyGeneratedUrl({
          projectId: locationProjectId.toString(),
          speciesSlug: s.slug,
          filenameWithoutExtension: filename.slice(0, filename.lastIndexOf('.')) ?? filename
        })}`
      }))
    )

  // Update
  await LocationProjectSpeciesFileModel(sequelize).bulkCreate(files)
}
