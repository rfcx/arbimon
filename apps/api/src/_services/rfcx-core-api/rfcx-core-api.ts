import { HTTPMethods } from 'fastify'

import { env } from '../../_services/env'

interface Endpoint {
  method: HTTPMethods
  url: string
}

const CORE_API_BASE_URL = env.CORE_API_BASE_URL

export const getUserProjects: Endpoint = {
  method: 'GET',
  url: `${CORE_API_BASE_URL}/projects`
}
