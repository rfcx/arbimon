import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ExportDetectionsBody, apiBioExportDetections } from '@rfcx-bio/common/api-bio/cnn/export-detections'

export const useExportDetections = (apiClient: AxiosInstance, jobId: number): UseMutationReturnType<void, unknown, ExportDetectionsBody, unknown> => {
  return useMutation({
    mutationKey: ['export-detections-body'],
    mutationFn: async (payload: ExportDetectionsBody) => { await apiBioExportDetections(apiClient, jobId, payload) }
  })
}
