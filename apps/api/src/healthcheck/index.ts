import { type RouteRegistration, GET } from '~/api-helpers/types'
import { getHealthCheckStatusHandler } from './get-healthcheck-status-handler'

export const routesHealthCheck: RouteRegistration[] = [
  {
    method: GET,
    url: '/health-check',
    handler: getHealthCheckStatusHandler
  }
]
