import { IUCNService } from '~/api/iucn-service/iucn-service-api'

export * from './types'
export const iucnService = new IUCNService(import.meta.env.VITE_BIO_API_HOST)
