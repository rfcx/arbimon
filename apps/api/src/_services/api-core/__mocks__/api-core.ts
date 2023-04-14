import { vi } from 'vitest'

const randomCoreId = (): string => (Math.random() + 1).toString(36).substring(6)
const randomArbimonId = (): number => Math.floor(Math.random() * 99999)

export const createProject = vi.fn(async (): Promise<string> => await Promise.resolve(randomCoreId()))
export const getProject = vi.fn(async (): Promise<{ external_id: number }> => await Promise.resolve({ external_id: randomArbimonId() }))
