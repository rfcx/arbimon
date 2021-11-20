import { BASE_URL_WIKI } from './env'
import { WikiService } from './wiki-service-api'

export * from './types'
export const wikiService = new WikiService(BASE_URL_WIKI)
