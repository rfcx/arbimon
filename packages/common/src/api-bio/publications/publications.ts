import { type AxiosInstance } from 'axios'

// A single publication in the Arbimon citations index.
export interface PublicationListItem {
  id: number
  title: string
  year: number | null
  doi: string | null
  url: string | null
  venue: string | null
  publicationType: string | null
  authors: string[]
  authorDisplay: string | null
  abstract: string | null
  citedByCount: number | null
  citationTier: 'A' | 'B' | 'C'
  techniques: string[]
  isRfcxAuthored: boolean
  rfcxCuratedUses: string | null
  hasPdf: boolean
}

export interface PublicationTechniqueCount {
  code: string
  displayName: string
  abbreviation: string | null
  count: number
}

export interface PublicationsResponse {
  total: number
  limit: number
  offset: number
  items: PublicationListItem[]
  // Facet counts across the *filtered* set (excluding the technique filter itself)
  techniqueFacets: PublicationTechniqueCount[]
}

export interface PublicationsQueryParams {
  // Free-text search over title + abstract + authors
  search?: string
  // Filter by technique code (e.g. 'pattern_matching'); repeatable
  technique?: string | string[]
  // Filter by citation tier
  tier?: 'A' | 'B' | 'C' | Array<'A' | 'B' | 'C'>
  yearFrom?: number
  yearTo?: number
  // Only papers authored by the RFCx/Arbimon team
  rfcxAuthored?: boolean
  // Pagination
  limit?: number
  offset?: number
  // Sort: 'year' (desc, default), 'citations' (desc), 'title' (asc)
  sort?: 'year' | 'citations' | 'title'
}

export const publicationsRoute = '/publications'

export const apiBioGetPublications = async (apiClient: AxiosInstance, params?: PublicationsQueryParams): Promise<PublicationsResponse> => {
  const response = await apiClient.get(publicationsRoute, { params })
  return response.data
}

// Technique taxonomy lookup endpoint
export interface PublicationTechnique {
  code: string
  displayName: string
  abbreviation: string | null
  description: string | null
  sortOrder: number
}

export const publicationTechniquesRoute = '/publications/techniques'

export const apiBioGetPublicationTechniques = async (apiClient: AxiosInstance): Promise<PublicationTechnique[]> => {
  const response = await apiClient.get(publicationTechniquesRoute)
  return response.data
}
