import { AxiosInstance } from 'axios'

// Request type
export interface ClassifierJobUpdateStatusParams {
  status?: number
  minutes_total?: number
}

export const apiCorePostClassifierJobUpdateStatus = async (apiClient: AxiosInstance, jobId: number, payload: ClassifierJobUpdateStatusParams): Promise<void> => {
  const res = await apiClient.patch<string>(`/classifier-jobs/${jobId}`, payload)
  if (res.status !== 200) {
    throw new Error('Unable to update job status')
  }
}
