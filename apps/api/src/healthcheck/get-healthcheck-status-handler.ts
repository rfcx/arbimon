import dayjs from 'dayjs'

import { type Handler } from '~/api-helpers/types'
import { authenticateDatabase } from '~/db'

export const getHealthCheckStatusHandler: Handler<{ up: boolean, databaseConnectionTimeMs: number }> = async (_, rep) => {
  const startTime = dayjs()

  const up = await authenticateDatabase()

  if (!up) {
    void rep.code(500)
    return {
      up: false,
      databaseConnectionTimeMs: dayjs().diff(startTime)
    }
  }

  return {
    up,
    databaseConnectionTimeMs: dayjs().diff(startTime)
  }
}
