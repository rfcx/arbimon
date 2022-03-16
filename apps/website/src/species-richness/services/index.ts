import { RichnessService } from './richness-services-api'

export const richnessService = new RichnessService(import.meta.env.VITE_BIO_API_BASE_URL)
