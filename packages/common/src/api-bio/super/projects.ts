import { type AxiosInstance } from 'axios'

import { type AccountTier, type LocationProjectTypes, type UserTypes } from '../../dao/types'
import { type ProjectMemberAddRemoveRequest, type ProjectMembersResponse, type ProjectMemberUpdateRequest } from '../project/project-members'
import { type LocationProjectQuery, type ProjectTieringUsage } from '../project/projects'

export interface SuperProjectLimits {
  recordingMinutesCount: number | null
  jobCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
}

export interface SuperPortfolioLimits {
  freeProjects: number | null
  premiumProjects: number | null
  unlimitedProjects: number | null
}

export interface SuperPortfolioUsage {
  freeProjects: number
  premiumProjects: number
  unlimitedProjects: number
}

export type SuperProjectSummary = LocationProjectTypes['light'] & {
  usage: ProjectTieringUsage
  limits: SuperProjectLimits
}

export type SuperUserSummary = UserTypes['light'] & {
  accountTier: AccountTier
  additionalPremiumProjectSlots: number
  ownedProjectCount: number
  limits: SuperPortfolioLimits
  usage: SuperPortfolioUsage
}

export interface SuperProjectQuery extends LocationProjectQuery {
  tier?: NonNullable<LocationProjectTypes['light']['projectType']>
}

export interface SuperUserQuery extends LocationProjectQuery {
  tier?: AccountTier
}

export interface SuperPaginationResponse<T> {
  data: T[]
  offset: number
  limit: number
  total: number
}

export interface SuperProjectTierUpdateBody {
  projectType?: NonNullable<LocationProjectTypes['light']['projectType']>
  isLocked?: boolean
}

export interface SuperUserTierUpdateBody {
  accountTier: AccountTier
  additionalPremiumProjectSlots: number
}

// Route
export const superProjectsRoute = '/super/projects'
export const superProjectMembersRoute = superProjectsRoute + '/:projectId/members'
export const superProjectTierRoute = superProjectsRoute + '/:projectId/tier'
export const superUsersRoute = '/super/users'
export const superUserProjectsRoute = superUsersRoute + '/:userId/projects'
export const superUserTierRoute = superUsersRoute + '/:userId/tier'

// Service
export const apiBioSuperGetProjects = async (apiClient: AxiosInstance, options: SuperProjectQuery): Promise<SuperPaginationResponse<SuperProjectSummary>> =>
  await apiClient.get<SuperPaginationResponse<SuperProjectSummary>>(superProjectsRoute, { params: options }).then(res => res.data)

export const apiBioSuperGetUsers = async (apiClient: AxiosInstance, options: SuperUserQuery): Promise<SuperPaginationResponse<SuperUserSummary>> =>
  await apiClient.get<SuperPaginationResponse<SuperUserSummary>>(superUsersRoute, { params: options }).then(res => res.data)

export const apiBioSuperGetUserProjects = async (apiClient: AxiosInstance, userId: number): Promise<SuperProjectSummary[]> =>
  await apiClient.get<SuperProjectSummary[]>(superUserProjectsRoute.replace(':userId', userId.toString())).then(res => res.data)

export const apiBioSuperGetProjectMembers = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectMembersResponse> => {
  return await apiClient.get(superProjectMembersRoute.replace(':projectId', projectId.toString())).then(res => res.data)
}

export const apiBioSuperUpdateProjectTier = async (apiClient: AxiosInstance, projectId: number, payload: SuperProjectTierUpdateBody): Promise<void> => {
  await apiClient.patch(superProjectTierRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioSuperAddProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.post(superProjectMembersRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioSuperUpdateProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberUpdateRequest): Promise<void> => {
  await apiClient.patch(superProjectMembersRoute.replace(':projectId', projectId.toString()), payload)
}

export const apiBioSuperRemoveProjectMember = async (apiClient: AxiosInstance, projectId: number, payload: ProjectMemberAddRemoveRequest): Promise<void> => {
  await apiClient.delete(superProjectMembersRoute.replace(':projectId', projectId.toString()), { data: payload })
}

export const apiBioSuperUpdateUserTier = async (apiClient: AxiosInstance, userId: number, payload: SuperUserTierUpdateBody): Promise<void> => {
  await apiClient.patch(superUserTierRoute.replace(':userId', userId.toString()), payload)
}
