import axios from 'axios'

import { type ProjectProfileLegacyUpdateBody } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type ProjectRole, getIdByRole } from '@rfcx-bio/common/roles'

import { unpackAxiosError } from '~/api-helpers/axios-errors'
import { env } from '../env'

const API_BASE_URL = env.ARBIMON_LEGACY_API_BASE_URL

async function post<T> (apiPath: string, token: string, data: any): Promise<T> {
  const res = await axios.request<T>({
    method: 'POST',
    url: `${API_BASE_URL}${apiPath}`,
    headers: { authorization: token },
    data
  }).catch(e => unpackAxiosError(e))
  return res.data
}

async function patch (apiPath: string, token: string, data: any): Promise<void> {
  await axios.request({
    method: 'PATCH',
    url: `${API_BASE_URL}${apiPath}`,
    headers: { authorization: token },
    data
  }).catch(e => unpackAxiosError(e))
}

export async function addProjectMemberLegacy (token: string, slug: string, email: string, role: Exclude<ProjectRole, 'none'>): Promise<void> {
  const data = {
    user_email: email,
    role_id: getIdByRole(role)
  }
  await post<{ success: boolean }>(`/project/${slug}/user/add`, token, data)
}

export async function removeProjectMemberLegacy (token: string, slug: string, email: string): Promise<void> {
  const data = {
    user_email: email
  }
  await post<{ success: boolean }>(`/project/${slug}/user/del`, token, data)
}

export async function updateProjectMemberLegacy (token: string, slug: string, email: string, role: Exclude<ProjectRole, 'none'>): Promise<void> {
  const data = {
    user_email: email,
    role_id: getIdByRole(role)
  }
  await post<{ success: boolean }>(`/project/${slug}/user/role`, token, data)
}

export async function updateProjectLegacy (token: string, slug: string, projectInformation: ProjectProfileLegacyUpdateBody): Promise<{ success: boolean, error?: string }> {
  return await post(`/project/${slug}/info/update`, token, projectInformation)
}

export async function updateProjectSlugLegacy (token: string, idCore: string, slug: string): Promise<void> {
  const data = {
    url: slug
  }
  await patch(`/integration/projects/${idCore}`, token, data)
}
