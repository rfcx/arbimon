import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectSpeciesFileModel } from '@rfcx-bio/common/dao/models/location-project-species-file-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { LocationProjectSpeciesFile } from '@rfcx-bio/common/dao/types/location-project-species-file'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'
import { requireEnv } from '~/env'
import { BioEnvironment } from '~/env/types'
import { rawFilenames } from '../_data/location-project-species-file'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

const baseUrls: Record<BioEnvironment, string> = {
  default: 'http://localhost:3000',
  testing: 'https://testing-bio.rfcx.org/api',
  staging: 'https://staging-bio.rfcx.org/api',
  production: 'https://bio.rfcx.org/api'
}

const baseUrl = baseUrls[BIO_ENVIRONMENT]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const puertoRicoProjectId = await getPuertoRicoProjectId(sequelize)
  if (Number.isNaN(puertoRicoProjectId)) return

  const species = await TaxonSpeciesModel(sequelize).findAll({ raw: true })

  // Convert data
  const files: LocationProjectSpeciesFile[] = species
    .flatMap(s => rawFilenames
      .filter(filename => filename.startsWith(s.slug))
      .map((filename, order) => ({
        locationProjectId: puertoRicoProjectId,
        taxonSpeciesId: s.id,
        description: `Predicted Occupancy Map for ${s.scientificName}`,
        order,
        filename,
        mimeType: 'image/png',
        url: `${baseUrl}/projects/${puertoRicoProjectId.toString()}/predicted-occupancy/${s.slug}/${filename.slice(0, filename.lastIndexOf('.')) ?? filename}`
      }))
    )

  // Update
  await LocationProjectSpeciesFileModel(sequelize).bulkCreate(files)
}
