import { vi } from 'vitest'

export const addProjectMemberLegacy = vi.fn(async (): Promise<void> => {})
export const removeProjectMemberLegacy = vi.fn(async (): Promise<void> => {})
export const updateProjectMemberLegacy = vi.fn(async (): Promise<void> => {})
export const updateProjectLegacy = vi.fn(async (): Promise<{ success: boolean, error?: string }> => {
  return await Promise.resolve({ success: true })
})
export const updateProjectSlugLegacy = vi.fn(async (): Promise<void> => {})
