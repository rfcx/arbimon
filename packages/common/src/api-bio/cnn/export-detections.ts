import { type AxiosInstance } from 'axios'

// Request types
export const EXPORT_DETECTIONS_TYPES = ['all-model-detections', 'results-per-day-recordings', 'species-detection-non-detection-matrix'] as const
export type ExportDetectionsType = typeof EXPORT_DETECTIONS_TYPES[number]

export interface ExportDetectionsBody {
  types: ExportDetectionsType[]
}

export interface ExportDetectionsParams {
  jobId: string
}

export const exportDetectionsRoute = '/jobs/:jobId/detections-export'

export const apiBioExportDetections = async (apiClient: AxiosInstance, jobId: number, body: ExportDetectionsBody): Promise<void> => {
  await apiClient.post(`/jobs/${jobId}/detections-export`, body)
}
