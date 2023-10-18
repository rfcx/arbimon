export interface LocationProjectProfile {
  locationProjectId: number
  summary: string
  readme: string
  keyResult: string
  resources: string
}

export const locationProjectProfileContentType = ['summary', 'readme', 'keyResult', 'resources'] as const
export type LocationProjectProfileContentType = typeof locationProjectProfileContentType[number]
