import { DashboardService } from './dashboard-service-api'

export const dashboardService = new DashboardService(import.meta.env.VITE_BIO_API_HOST)
