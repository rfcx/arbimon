import { type RawElasticSearchResponseBody, type SearchQueryProjectRawResponse, type SearchResponse, type SearchResponseProject } from '@rfcx-bio/common/api-bio/search/search'

import { fileUrl } from '~/format-helpers/file-url'
import { getOpenSearchClient } from '~/opensearch'
import { getAverageCoordinate } from './helpers'

export const getOpensearchProjects = async (query: string, status: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const opensearch = getOpenSearchClient()

  const response = await opensearch.search<RawElasticSearchResponseBody<SearchQueryProjectRawResponse>>({
    from: offset,
    size: limit,
    index: 'projects',
    body: {
      query: {
        bool: {
          filter: [
            {
              term: {
                status
              }
            }
          ],
          should: [
              {
                multi_match: {
                  type: 'bool_prefix',
                  query,
                  fields: [
                    'name',
                    'name._2gram',
                    'name._3gram',
                    'expanded_country_names',
                    'expanded_country_names._2gram',
                    'expanded_country_names._3gram',
                    'expanded_objectives',
                    'expanded_objectives._2gram',
                    'expanded_objectives._3gram',
                    'summary',
                    'readme'
                  ]
                }
              },
              // Allow searching for species
              {
                nested: {
                  path: 'species',
                  query: {
                    multi_match: {
                      // Enable complex queries like 'endangered birds in Puerto Rico'
                      type: 'cross_fields',
                      query,
                      fields: [
                        'species.scientific_name',
                        'species.common_name',
                        'species.taxon_class',
                        'species.risk_rating',
                        'species.risk_category',
                        'species.countries'
                      ]
                    }
                  }
                }
              }
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
      thumbnail: fileUrl(hit._source.thumbnail) ?? '',
      objectives: hit._source.objectives,
      summary: hit._source.summary,
      readme: hit._source.readme,
      speciesCount: hit._source.species_count,
      recordingMinutesCount: hit._source.recording_minutes_count,
      countryCodes: hit._source.country_codes,
      species: hit._source.species
    }
  })

  return {
    total: response.body.hits.total.value,
    data
  }
}
