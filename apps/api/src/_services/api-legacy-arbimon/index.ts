import axios from 'axios'

import { type ProjectProfileLegacyUpdateBody } from '@rfcx-bio/common/api-bio/project/project-settings'
import { type ProjectRole, getIdByRole } from '@rfcx-bio/common/roles'

import { unpackAxiosError } from '~/api-helpers/axios-errors'
import { env } from '../env'

const API_BASE_URL = env.ARBIMON_LEGACY_API_BASE_URL

export async function addProjectMemberOnLegacyAndCore (token: string, slug: string, email: string, role: Exclude<ProjectRole, 'none'>): Promise<void> {
  try {
    await axios.request<{ success: boolean }>({
      method: 'POST',
      url: `${API_BASE_URL}/project/${slug}/user/add`,
      headers: {
        authorization: token
      },
      data: {
        user_email: email,
        role_id: getIdByRole(role)
      }
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function removeProjectMemberOnLegacyAndCore (token: string, slug: string, email: string): Promise<void> {
  try {
    await axios.request<{ success: boolean }>({
      method: 'POST',
      url: `${API_BASE_URL}/project/${slug}/user/del`,
      headers: {
        authorization: token
      },
      data: {
        user_email: email
      }
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function updateProjectMemberOnLegacyAndCore (token: string, slug: string, email: string, role: Exclude<ProjectRole, 'none'>): Promise<void> {
  try {
    await axios.request<{ success: boolean }>({
      method: 'POST',
      url: `${API_BASE_URL}/project/${slug}/user/role`,
      headers: {
        authorization: token
      },
      data: {
        user_email: email,
        role_id: getIdByRole(role)
      }
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function updateProjectSettingsOnLegacyAndCore (token: string, slug: string, projectInformation: ProjectProfileLegacyUpdateBody): Promise<void> {
  try {
    await axios.request({
      method: 'POST',
      url: `${API_BASE_URL}/project/${slug}/info/update`,
      headers: {
        authorization: token
      },
      data: projectInformation
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}
