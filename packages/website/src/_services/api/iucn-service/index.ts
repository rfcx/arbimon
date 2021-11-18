import { IUCNService } from '~/api/iucn-service/iucn-service-api'

const BIO_API_HOST: string = import.meta.env.VITE_BIO_API_HOST

export * from './types'
export const iucnService = new IUCNService(BIO_API_HOST)
