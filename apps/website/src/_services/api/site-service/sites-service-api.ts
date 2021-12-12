// import { AxiosRequestConfig } from 'axios'
//
// import { Project, Site } from '~/api/types'
// import ApiClient from '~/api-helpers/rest/api-service'
// import { endpointSites } from '../../api-helpers/rest'
//
// const CORE_API_HOST: string = import.meta.env.VITE_CORE_API_HOST // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts
//
// export const endpointSites: AxiosRequestConfig = {
//   method: 'GET',
//   url: `${CORE_API_HOST}/streams`
// }
//
// TODO 132 - Fix this; it ignores the project
// export const getSites = async (project: Project): Promise<Site[]> => {
//   const { method, url } = endpointSites
//
//   try {
//     const resp = await ApiClient.request<Site[]>({
//       url,
//       method
//     })
//     return resp
//   } catch (e) {
//     return await Promise.reject(e)
//   }
// }
