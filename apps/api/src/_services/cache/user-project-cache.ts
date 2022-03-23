import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { dayjs } from '~/dayjs-initialized'
import { getSequelize } from '~/db'

export const EXPIRED_DURATION_HOURS = 1

export const getMemberProjectCoreIds = async (userIdAuth0: string): Promise<string[] | undefined> =>
  await ModelRepository.getInstance(getSequelize())
    .CacheUserProject
    .findByPk(userIdAuth0, { raw: true })
    .then(cache => {
      if (!cache || dayjs(cache?.expiredAt).isAfter(dayjs())) return undefined
      return cache?.projectCoreIds
    })

export const updateMemberProjectCoreIds = async (userIdAuth0: string, projectCoreIds: string[]): Promise<void> => {
  const expiredAt = dayjs().add(EXPIRED_DURATION_HOURS, 'hours').toDate()
  await ModelRepository.getInstance(getSequelize())
    .CacheUserProject
    .upsert({ userIdAuth0, projectCoreIds, expiredAt })
}
