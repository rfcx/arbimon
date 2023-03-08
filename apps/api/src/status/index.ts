import { type RouteRegistration, GET } from '../_services/api-helpers/types'

export const routesStatus: RouteRegistration[] = [
  {
    method: GET,
    url: '/',
    handler: async () => 'Biodiversity API is online!'
  }
]
