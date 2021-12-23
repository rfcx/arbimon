export interface Project {
  id?: string // TODO ?? - Are these properties really optional?!
  name?: string
  isPublic?: boolean
  externalId?: number
  geoBounds: [
    { lon: number, lat: number },
    { lon: number, lat: number }
  ]
}
