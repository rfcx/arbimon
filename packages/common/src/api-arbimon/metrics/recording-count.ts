import { type AxiosInstance } from 'axios'

export interface RecordingCount {
  count: number
}

// Service
export const apiArbimonGetRecordingCount = async (apiClient: AxiosInstance, slug: string): Promise<RecordingCount | undefined> => {
  if (slug !== undefined) {
    return await apiClient.get<RecordingCount>(`/legacy-api/project/${slug}/recordings/search?output=count&output=list`).then(res => res.data)
  } else return undefined
}
