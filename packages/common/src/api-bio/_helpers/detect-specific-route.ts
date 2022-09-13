export interface DetectRouteParamsSerialized {
  jobId: string
}

export const DETECT_SPECIFIC_ROUTE_PREFIX = '/jobs/:jobId/detect'
export const detectSpecificRoutePrefix = (jobId: string | number): string => `/jobs/${jobId}/detect`
