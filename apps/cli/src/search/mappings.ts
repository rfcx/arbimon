export const mappings = {
  properties: {
    id: {
      type: 'integer'
    },
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
      type: 'keyword',
      ignore_above: 256
    },
    date_start: {
      type: 'date'
    },
    date_end: {
      type: 'date'
    },
    objectives: {
      type: 'text',
      analyzer: 'objective_synonym_analyzer',
      search_analyzer: 'objective_synonym_analyzer'
    },
    image: {
      type: 'keyword',
      ignore_above: 256
    },
    country_codes: {
      type: 'text',
      analyzer: 'country_synonym_analyzer',
      search_analyzer: 'country_synonym_analyzer'
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
    recordin_min_date: {
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
    }
  }
}