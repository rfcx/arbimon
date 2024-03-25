import { type SearchQueryProjectRawResponse } from '@rfcx-bio/common/api-bio/search/search'
import { type Project, type ProjectStatus } from '@rfcx-bio/common/src/dao/types'

export const makeProject = (id: number, name: string, status: ProjectStatus = 'published'): Project => {
  return {
    id,
    idCore: id.toString(),
    idArbimon: id,
    slug: name.toLowerCase().replace(' ', '-'),
    name,
    status,
    statusUpdatedAt: new Date(),
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }
}

export const makeIndexRequest = (
  index: string,
  project: Project,
  waitForRefresh: boolean | 'wait_for',
  summary = '',
  objectives: string[] = [],
  countryCodes: string[] = [],
  additionalData?: Record<string, any>
): { id: string, index: string, body: SearchQueryProjectRawResponse['_source'], refresh: boolean | 'wait_for' } => {
  return {
    id: project.id.toString(),
    index,
    body: {
      id_core: project.idCore,
      id_arbimon: project.idArbimon,
      name: project.name,
      slug: project.slug,
      status: project.status,
      latitude_north: project.latitudeNorth,
      latitude_south: project.latitudeSouth,
      longitude_east: project.longitudeEast,
      longitude_west: project.longitudeWest,
      summary,
      readme: '',
      date_start: null,
      date_end: null,
      objectives,
      image: '',
      country_codes: countryCodes,
      expanded_country_names: [],
      expanded_objectives: [],
      species_count: 12,
      recording_minutes_count: 13994,
      detection_minutes_count: 12344,
      min_date: '2023-01-01T00:00:00.000Z',
      max_date: '2023-07-14T12:28:38.943Z',
      recording_min_date: '2023-01-01T00:00:00.000Z',
      recording_max_date: '2023-07-14T12:28:38.943Z',
      detection_min_date: '2023-02-14T12:22:22.948Z',
      detection_max_date: '2023-06-30T18:33:44.938Z',
      ...(additionalData ?? {})
    },
    refresh: waitForRefresh
  }
}
