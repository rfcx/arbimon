import { vi } from 'vitest'

export const addProjectMemberLegacy = vi.fn(async (): Promise<void> => {})
export const removeProjectMemberLegacy = vi.fn(async (): Promise<void> => {})
export const updateProjectMemberLegacy = vi.fn(async (): Promise<void> => {})
export const updateProjectLegacy = vi.fn(async (): Promise<{ success: boolean, error?: string }> => {
  return await Promise.resolve({ success: true })
})
export const updateProjectSlugLegacy = vi.fn(async (): Promise<void> => {})
export const getProjectTieringUsageLegacy = vi.fn(async (): Promise<{ recordingMinutesCount: number, collaboratorCount: number, guestCount: number, patternMatchingCount: number, jobCount: number }> => {
  return await Promise.resolve({ recordingMinutesCount: 0, collaboratorCount: 0, guestCount: 0, patternMatchingCount: 0, jobCount: 0 })
})
