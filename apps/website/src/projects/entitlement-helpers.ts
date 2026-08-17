import { type AccountTier, type ProjectType } from '@rfcx-bio/common/dao/types'

export interface ProjectUsageLimitSummary {
  recordingMinutesCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
  /** Max Admin-role members (subset of collaborators). NULL/undefined = unlimited. */
  adminCount?: number | null
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
  // Client-side FALLBACK for when the server's limits are unavailable. It
  // must never be TIGHTER than the server (bio-api project_type_limit rows),
  // so everything is null (= no client-side gating and, since the team-shape
  // banner only shows for armed caps, no banner) until the server responds.
  // The server's effective limits are the authority (free is 5/1 as of the
  // 2026-08-17 team-shape migration; tunable in DB without rebuild).
  return {
    recordingMinutesCount: null,
    collaboratorCount: null,
    guestCount: null,
    adminCount: null,
    jobCount: null,
    jobRecordingCount: null
  }
}
