import { type AccountTier, type ProjectType } from '@rfcx-bio/common/dao/types'

export interface ProjectUsageLimitSummary {
  recordingMinutesCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
  jobCount: number | null
  jobRecordingCount: number | null
}

export const ACCOUNT_TIER_LABELS: Record<AccountTier, string> = {
  free: 'Free',
  pro: 'Pro'
}

export const ACCOUNT_TIER_DESCRIPTIONS: Record<AccountTier, string> = {
  free: 'Your projects are Free projects.',
  pro: 'Your projects are Premium projects.'
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  free: 'Free',
  premium: 'Premium',
  unlimited: 'Unlimited'
}

export const getAllowedProjectTypesForTier = (tier: AccountTier): ProjectType[] => {
  if (tier === 'pro') return ['premium', 'free']
  return ['free']
}

export const formatTierLimit = (limit: number | null): string => {
  return limit === null ? 'Unlimited' : String(limit)
}

export const getProjectTypeCreateDescription = (projectType: ProjectType): string => {
  if (projectType === 'premium') return 'Private or public with premium project limits.'
  if (projectType === 'unlimited') return 'Unlimited-capacity project type (legacy).'
  return 'Public only, for projects under the Free project-type rules.'
}

export const getProjectTypeUsageLimits = (projectType: ProjectType): ProjectUsageLimitSummary => {
  // Tier rollback (2026-07-12): all limits are unlimited for every project
  // type. This client-side fallback must never be tighter than the server
  // (bio-api project_type_limit rows, which are all NULL).
  return {
    recordingMinutesCount: null,
    collaboratorCount: null,
    guestCount: null,
    jobCount: null,
    jobRecordingCount: null
  }
}
