export interface LocationProjectProfile {
  locationProjectId: number
  summary: string
  image: string
  readme: string
  methods: string
  keyResult: string
  resources: string
  objectives: string[]
  dateStart: Date | null
  dateEnd: Date | null
}

/**
 * Date
 * - dateStart = null means no input
 * - dateEnd = null means ongoing
 * 4 possible combinations:
 * - null x null = no input (default)
 * - null x date = no input (unexpected)
 * - date x null = ongoing
 * - date x date = date range
 */

export const locationProjectProfileContentType = ['summary', 'readme', 'keyResult', 'resources', 'methods'] as const
export type LocationProjectProfileContentType = typeof locationProjectProfileContentType[number]
