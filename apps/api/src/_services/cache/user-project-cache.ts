import { Op } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { dayjs } from '~/dayjs-initialized'
import { getSequelize } from '~/db'

export const EXPIRED_DURATION_HOURS = 1

export const getMemberProjectCoreIdsFromCache = async (userIdAuth0: string): Promise<string[] | undefined> =>
  await ModelRepository.getInstance(getSequelize())
    .CacheUserProject
    .findOne({
      where: { userIdAuth0, expiredAt: { [Op.gt]: dayjs().toISOString() } },
      raw: true
    })
    .then(cache => cache?.projectCoreIds)

export const updateMemberProjectCoreIds = async (userIdAuth0: string, projectCoreIds: string[]): Promise<void> => {
  const expiredAt = dayjs().add(EXPIRED_DURATION_HOURS, 'hours').toDate()
  await ModelRepository.getInstance(getSequelize())
    .CacheUserProject
    .upsert({ userIdAuth0, projectCoreIds, expiredAt })
}
