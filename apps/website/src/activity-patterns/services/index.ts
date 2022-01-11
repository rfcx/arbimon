import { AssetsService } from './assets-service-api'
import { SpotlightService } from './spotlight-services-api'

export const assetsService = new AssetsService()
export const spotlightService = new SpotlightService(import.meta.env.VITE_BIO_API_BASE_URL)
