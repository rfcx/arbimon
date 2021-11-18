import { BASE_URL_IUCN } from '~/api/iucn-service/env'
import { IUCNService } from '~/api/iucn-service/iucn-service-api'

export * from './types'
export const iucnService = new IUCNService(BASE_URL_IUCN)
