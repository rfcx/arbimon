import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { rawEnvToProjectAndProfile } from '@/db/seeders/_data/location-project-and-profile'
import { requireEnv } from '~/env'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

/**
 * If the project cannot be found, this returns NaN
 * You should check the result using Number.isNaN
 */
export const getPuertoRicoProjectId = async (sequelize: Sequelize): Promise<number> => {
  const models = ModelRepository.getInstance(sequelize)

  // Find PR project slug
  const puertoRicoSlug = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .find(p => p.slug.startsWith('puerto'))
    ?.slug ?? 'puerto-rico'

  // Lookup PR project ID
  const puertoRicoProject = await models.Project
    .findOne({
      where: { slug: puertoRicoSlug },
      attributes: ['id']
    })

  return puertoRicoProject?.id ?? NaN
}
