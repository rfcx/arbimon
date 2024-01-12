import { type RouteRegistration, GET } from '~/api-helpers/types'
import { searchHandler } from './search-handler'

export const routesSearch: RouteRegistration[] = [
  {
    method: GET,
    url: '/search',
    handler: searchHandler
  }
]
