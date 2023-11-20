import { type LocationProjectProfile } from '../../dao/types'
import { type ProjectRouteParamsSerialized } from '../_helpers'

// Request types
export type ProjectProfileParams = ProjectRouteParamsSerialized

export interface ProjectProfileUpdateBody {
  summary?: string
  objectives?: string[]
  dateStart?: string
  dateEnd?: string | null
}

// Response types
export type ProjectProfileResponse = Pick<LocationProjectProfile, 'summary' | 'objectives' | 'dateStart' | 'dateEnd'>
