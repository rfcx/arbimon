import { RouteLocationNormalized } from 'vue-router'

export const ANALYTICS_CONFIGS = {
  appName: import.meta.env.VITE_APP_NAME,
  pageTrackerScreenviewEnabled: true,
  config: {
    id: import.meta.env.VITE_GA_MEASUREMENT_ID
  },
  pageTrackerEnabled: true,
  pageTrackerTemplate (to: RouteLocationNormalized, from: RouteLocationNormalized) {
    return {
      page_title: to.name,
      page_path: to.path,
      project_id: to.params?.projectId
    }
  }
}
