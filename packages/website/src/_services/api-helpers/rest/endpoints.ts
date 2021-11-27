import { AxiosRequestConfig } from 'axios'

const CORE = 'https://staging-api.rfcx.org'

// Example: to be updated
export const endpointSites: AxiosRequestConfig = {
  method: 'GET',
  url: `${CORE}/streams`
}

export const endpointProjects: AxiosRequestConfig = {
  method: 'GET',
  url: `${CORE}/projects`
}
