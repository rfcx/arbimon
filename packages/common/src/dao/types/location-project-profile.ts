export interface LocationProjectProfile {
  locationProjectId: number
  summary: string
  readme: string
  methods: string
  keyResult: string
  resources: string
  objectives: string[]
  dateStart: Date | null
  dateEnd: Date | null
}

export const locationProjectProfileContentType = ['summary', 'readme', 'keyResult', 'resources', 'methods'] as const
export type LocationProjectProfileContentType = typeof locationProjectProfileContentType[number]
