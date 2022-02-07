// Request
export interface CoreMediaQuery {
  url: string
}

export const coreMediaRoute = '/core-media'

export const coreMediaUrl = (): string => '/core-media'

// Blob
export interface CoreMediaResponse {
  media: Blob | undefined
}
