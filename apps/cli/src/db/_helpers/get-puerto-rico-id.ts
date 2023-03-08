import { type Sequelize } from 'sequelize'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { rawEnvToProjectAndProfile } from '@/db/seeders/_data/location-project-and-profile'
import { requireEnv } from '~/env'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

/**
 * If the project cannot be found, this returns NaN
 * You should check the result using Number.isNaN
 */
export const getPuertoRicoProjectId = async (sequelize: Sequelize): Promise<number> => {
  // Find PR project slug
  const puertoRicoSlug = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .find(p => p.slug.startsWith('puerto'))
    ?.slug ?? 'puerto-rico'

  // Lookup PR project ID
  const puertoRicoProject = await LocationProjectModel(sequelize)
    .findOne({
      where: { slug: puertoRicoSlug },
      attributes: ['id']
    })

  return puertoRicoProject?.id ?? NaN
}
