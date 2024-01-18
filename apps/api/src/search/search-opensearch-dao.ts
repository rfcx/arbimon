import { type RawElasticSearchResponseBody, type SearchQueryProjectRawResponse, type SearchResponse, type SearchResponseProject } from '@rfcx-bio/common/api-bio/search/search'

import { fileUrl } from '~/format-helpers/file-url'
import { getOpenSearchClient } from '~/opensearch'
import { getAverageCoordinate } from './helpers'

export const getOpensearchProjects = async (query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const opensearch = getOpenSearchClient()

  const response = await opensearch.search<RawElasticSearchResponseBody<SearchQueryProjectRawResponse>>({
    from: offset,
    size: limit,
    index: 'projects',
    body: {
      query: {
        multi_match: {
          query,
          fields: [
            'name',
            'name._2gram',
            'name._3gram',
            'objectives',
            'country_codes',
            'summary'
          ]
        }
      }
    }
  })

  const data: SearchResponseProject[] = response.body.hits.hits.map(hit => {
    return {
      type: 'project',
      avgLatitude: getAverageCoordinate(hit._source.latitude_north, hit._source.latitude_south),
      avgLongitude: getAverageCoordinate(hit._source.longitude_west, hit._source.longitude_east),
      id: Number(hit._id),
      idCore: hit._source.id_core,
      idArbimon: hit._source.id_arbimon,
      name: hit._source.name,
      slug: hit._source.slug,
      status: hit._source.status,
      image: fileUrl(hit._source.image) ?? '',
      objectives: hit._source.objectives,
      summary: hit._source.summary,
      speciesCount: hit._source.species_count,
      recordingMinutesCount: hit._source.recording_minutes_count,
      countryCodes: hit._source.country_codes
    }
  })

  return {
    total: response.body.hits.total.value,
    data
  }
}
