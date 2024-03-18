const mappings = {
  properties: {
    id_core: {
      type: 'keyword',
      ignore_above: 256
    },
    id_arbimon: {
      type: 'integer'
    },
    name: {
      type: 'search_as_you_type'
    },
    slug: {
      type: 'keyword',
      ignore_above: 256
    },
    status: {
      type: 'keyword',
      ignore_above: 256
    },
    latitude_north: {
      type: 'float'
    },
    latitude_south: {
      type: 'float'
    },
    longitude_east: {
      type: 'float'
    },
    longitude_west: {
      type: 'float'
    },
    summary: {
      type: 'text',
      analyzer: 'simple'
    },
    readme: {
      type: 'text',
      analyzer: 'simple'
    },
    date_start: {
      type: 'date'
    },
    date_end: {
      type: 'date'
    },
    objectives: {
      type: 'text'
    },
    image: {
      type: 'keyword',
      ignore_above: 256
    },
    country_codes: {
      type: 'text'
    },
    species_count: {
      type: 'long'
    },
    recording_minutes_count: {
      type: 'long'
    },
    detection_minutes_count: {
      type: 'long'
    },
    min_date: {
      type: 'date'
    },
    max_date: {
      type: 'date'
    },
    recording_min_date: {
      type: 'date'
    },
    recording_max_date: {
      type: 'date'
    },
    detection_min_date: {
      type: 'date'
    },
    detection_max_date: {
      type: 'date'
    },
    expanded_country_names: {
      type: 'search_as_you_type'
    },
    expanded_objectives: {
      type: 'search_as_you_type'
    },
    species: {
      type: 'object',
      properties: {
        scientific_name: { type: 'keyword' },
        common_name: { type: 'keyword' },
        taxon_class: { type: 'keyword' },
        risk_rating: { type: 'keyword' },
        is_threatened: { type: 'boolean' }
      }
    }
  }
} as const

export const getMappings = (): typeof mappings => {
  return mappings
}
