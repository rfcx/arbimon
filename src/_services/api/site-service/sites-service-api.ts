// import { Project, Site } from '~/api/types'
// import ApiClient from '~/api-helpers/rest/api-service'
// import { endpointSites } from '../../api-helpers/rest'

// TODO ??? - Fix this; it ignores the project
// export const getSites = async (project: Project): Promise<Site[]> => {
//   const { method, url } = endpointSites

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
