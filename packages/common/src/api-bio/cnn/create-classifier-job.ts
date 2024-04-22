import { type AxiosInstance } from 'axios'

// Request types
export interface CreateClassifierJobBody {
  classifierId: number
  projectId: number
  queryStreams?: string
  queryStart: string
  queryEnd: string
  queryHours: string
  minutesTotal: number
}

// Route
export const createClassifierJobRoute = '/jobs'

// Service
export const apiBioCreateClassifierJob = async (apiClientBio: AxiosInstance, options: CreateClassifierJobBody): Promise<string> => {
  const response = await apiClientBio.post('/jobs', options)
  const location = response.headers?.location
  return location ?? ''
}
