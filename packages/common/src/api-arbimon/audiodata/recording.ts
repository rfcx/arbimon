import type { AxiosInstance } from 'axios'

export interface RecordingSearchParams {
  limit?: number
  offset?: number
  output?: Array<'count' | 'date_range' | 'list'>
  sortBy?: string
}

export interface RecordingSearchResponse {
  count?: number
  date_range?: {
    min: string
    max: string
  }
  list?: any[] // กำหนด type เพิ่มได้ถ้าทราบโครงสร้างของรายการ recordings
}

export const apiArbimonGetRecordings = async (
  apiClient: AxiosInstance,
  slug: string,
  params: RecordingSearchParams
): Promise<RecordingSearchResponse | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<RecordingSearchResponse>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/recordings/search`,
      params: {
        ...params,
        output: params.output // แปลง array เป็น query string แบบ repeat เช่น output=count&output=list
      }
    })
    return response.data
  } else return undefined
}
