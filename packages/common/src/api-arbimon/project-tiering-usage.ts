import { type AxiosInstance } from 'axios'

export interface LegacyProjectTieringUsage {
  recordingMinutesCount: number
  collaboratorCount: number
  guestCount: number
  patternMatchingCount: number
  jobCount: number
}

export const apiArbimonGetProjectTieringUsage = async (apiClient: AxiosInstance, slug: string): Promise<LegacyProjectTieringUsage> => {
  return await apiClient.get<LegacyProjectTieringUsage>(`/legacy-api/project/${slug}/tiering-usage`).then(res => res.data)
}
