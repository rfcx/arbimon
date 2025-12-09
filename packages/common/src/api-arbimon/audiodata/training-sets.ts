import type { AxiosInstance } from 'axios'

export interface TrainingSet {
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

export interface RecordingTrainingSet {
  id: number
  recording: number
  species: number
  name: string
  songtype: number
  species_name: string
  songtype_name: string
  x1: number
  y1: number
  x2: number
  y2: number
  uri: string
}

export interface RecordingTrainingSetParams {
  trainingSetId: number | string
  recordingId: number | string
}

export interface CreateTrainingSetParams {
  trainingSetId: number
  recording: number
  roi: {
    x1: number
    x2: number
    y1: number
    y2: number
  }
}

export interface CreateTrainingSetResponse {
  id: number
  recording: number
  songtype: number
  species: number
  uri: string
  x1: number
  x2: number
  y1: number
  y2: number
}

export interface AddNewTrainingSetParams {
  class: number
  name: string
  type: string
}

export interface AddNewTrainingSetResponse {
  id: number
  name: string
  date_created: string
  project: number
  source_project_id: number
  metadata: string
  type: string
  species: number
  species_name: string
  songtype: number
  songtype_name: string
}

export const apiGetTrainingSets = async (apiClient: AxiosInstance, slug: string): Promise<TrainingSet[] | undefined> => {
  const url = `/legacy-api/project/${slug}/training-sets`
  const response = await apiClient.request<TrainingSet[]>({
    method: 'GET',
    url
  })

  return response.data
}

export const apiGetRecordingTrainingSets = async (apiClient: AxiosInstance, slug: string, trainingSetId: number | string, recordingId: number | string): Promise<RecordingTrainingSet[] | undefined> => {
  const url = `/legacy-api/project/${slug}/training-sets/list/${trainingSetId}/${recordingId}`
  const response = await apiClient.request<RecordingTrainingSet[]>({
    method: 'GET',
    url
  })

  return response.data
}

export const apiPostTrainingSet = async (apiClient: AxiosInstance, slug: string, payload: CreateTrainingSetParams): Promise<CreateTrainingSetResponse> => {
  const url = `/legacy-api/project/${slug}/training-sets/add-data/${payload.trainingSetId}`
  const opts = Object.fromEntries(
    Object.entries(payload).filter(([k]) => k !== 'trainingSetId')
  )
  const res = await apiClient.request<CreateTrainingSetResponse>({
    method: 'POST',
    url,
    data: opts
  })

  return res.data
}

export const apiPostNewTrainingSet = async (apiClient: AxiosInstance, slug: string, payload: AddNewTrainingSetParams): Promise<AddNewTrainingSetResponse> => {
  const url = `/legacy-api/project/${slug}/training-sets/add`
  const res = await apiClient.request<AddNewTrainingSetResponse>({
    method: 'POST',
    url,
    data: payload
  })

  return res.data
}
