import axios, { AxiosRequestConfig } from 'axios'
import { FastifyReply, FastifyRequest } from 'fastify'
import { FAKE_PUERTO_RICO_PROJECT } from 'projects/controller-projects-all'

import { CoreProjectWithPermissionLite } from '@rfcx-bio/common/api-bio/common/permission'

import { getUserProjects } from '../rfcx-core-api/rfcx-core-api'

export async function verifyProjectUserPermission (req: FastifyRequest, res: FastifyReply): Promise<void> {
  const token = req.headers.authorization
  // @ts-expect-error
  const bioProjectId = req.params.projectId

  // TODO: Update it to be real project list query from db
  const coreProjectId = [FAKE_PUERTO_RICO_PROJECT].find(p => p.id === bioProjectId)?.idCore

  if (token === undefined || bioProjectId === undefined || coreProjectId === undefined) return

  const { method, url } = getUserProjects
  const endpoint: AxiosRequestConfig = {
    method,
    url: `${url}?fields=id&fields=name&fields=permissions`,
    headers: { authorization: token }
  }

  try {
    const resp = await axios.request<CoreProjectWithPermissionLite[]>(endpoint)
    const project = resp.data.find(p => p.id === coreProjectId)
    req.requestContext.set('projectPermission', project)
  } catch {
    console.error('Failed to get user project permission with token:', token)
  }
}
