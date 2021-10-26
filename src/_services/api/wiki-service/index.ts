import { BASE_URL_WIKI } from '~/api/wiki-service/env'
import { WikiService } from '~/api/wiki-service/wiki-service-api'

export * from './types'
export const wikiService = new WikiService(BASE_URL_WIKI)
