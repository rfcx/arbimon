import { type AxiosInstance } from 'axios'

// Response type
export interface GeoProjectLocationResponse {
  country: string
  countryCode: string
  timezone: string
}

export const apiGeoGetProjectLocation = async (apiClient: AxiosInstance, lat: number | undefined, long: number | undefined): Promise<GeoProjectLocationResponse | undefined> => {
  if (lat !== undefined && long !== undefined) {
    return await apiClient.get(`/reverse?lat=${lat}&lon=${long}&apiKey=5a8e8fdff1f44dbda20ca67b4e99362b`, { headers: { 'Access-Control-Allow-Origin': 'http://localhost:8101' } }).then(res => {
      if (res.data !== undefined) {
        const result = res.data.features[0]
        return {
          country: result.country,
          countryCode: result.country_code,
          timezone: result.timezone.name
        }
      } else return undefined
    })
  } else return undefined
}
