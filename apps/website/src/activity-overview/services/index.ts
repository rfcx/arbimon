import { ActivityService } from '@/activity-overview/services/activity-service'

export const activityService = new ActivityService(import.meta.env.VITE_BIO_API_BASE_URL)
