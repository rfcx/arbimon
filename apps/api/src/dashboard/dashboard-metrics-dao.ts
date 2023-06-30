import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectMetricTypes } from '@rfcx-bio/common/dao/types/location-project-metric'

import { getSequelize } from '~/db'

export const getProjectMetrics = async (locationProjectId: number): Promise<LocationProjectMetricTypes['light'] & { siteCount: number }> => {
  const { LocationProjectMetric, LocationSite } = ModelRepository.getInstance(getSequelize())
  const siteCount = await LocationSite.count({ where: { locationProjectId } })
  const metric = await LocationProjectMetric.findOne({
      attributes: { exclude: ['locationProjectId'] },
      where: { locationProjectId },
      raw: true
    }) ?? { detectionMinutesCount: 0, speciesCount: 0, maxDate: null, minDate: null }

  return { ...metric, siteCount }
}
