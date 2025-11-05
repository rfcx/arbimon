import type { AxiosInstance } from 'axios'

export interface LegacyTrainingSet {
  id: number
  name: string
  date_created: string
  project: number
  species: number
  species_name: string
  songtype: number
  songtype_name: string
  metadata?: string | null
  type?: string
  source_project_id?: number | null
}

export const apiLegacyGetTrainingSets = async (
  apiClient: AxiosInstance,
  slug: string
): Promise<LegacyTrainingSet[] | undefined> => {
  if (!slug) return undefined

  const url = `/legacy-api/project/${slug}/training-sets`
  const response = await apiClient.request<LegacyTrainingSet[]>({
    method: 'GET',
    url
  })

  return response.data
}
