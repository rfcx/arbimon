import { DashboardService } from './dashboard-service'

export const dashboardService = new DashboardService(import.meta.env.VITE_BIO_API_BASE_URL)
