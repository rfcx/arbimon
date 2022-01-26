import axios, { AxiosRequestConfig } from 'axios'
import { FastifyReply, FastifyRequest } from 'fastify'
import { FAKE_PUERTO_RICO_PROJECT } from 'projects/controller-projects-all'

import { getUserProjects } from '../rfcx-core-api/rfcx-core-api'

type ProjectPermission = 'C' | 'R' | 'U' | 'D'

interface CoreProjectWithPermissionLite {
  id: string
  name: string
  permission: ProjectPermission[]
}

export async function verifyProjectUser (req: FastifyRequest, res: FastifyReply): Promise<void> {
  const token = req.headers.authorization
  // @ts-expect-error
  const bioProjectId = req.params.projectId
  // TODO: Update it to be real project list
  const coreProjectId = [FAKE_PUERTO_RICO_PROJECT].find(p => p.id === bioProjectId)?.idOnCore

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
    // @ts-expect-error
    req.projectPermission = project
  } catch {
    console.error('Failed to get user project permission with token:', token)
  }
}
