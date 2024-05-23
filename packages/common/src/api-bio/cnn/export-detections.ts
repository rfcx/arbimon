import { type AxiosInstance } from 'axios'

// Request types
export type ExportDetectionsType = 'all-model-detections' | 'results-per-day-recordings' | 'species-detection-non-detection-matrix'

export interface ExportDetectionsBody {
  type: ExportDetectionsType
}

export interface ExportDetectionsParams {
  jobId: string
}

export const exportDetectionsRoute = '/jobs/:jobId/detections-export'

export const apiBioExportDetections = async (apiClient: AxiosInstance, jobId: number, body: ExportDetectionsBody): Promise<void> => {
  await apiClient.post(`/jobs/${jobId}/detections-export`, body)
}
