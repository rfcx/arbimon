export interface ArbimonHourlySpeciesRow {
  'arbimon_site_id': number
  'stream_id': string
  'name': string
  'lat': number
  'lon': number
  'alt': number
  'date': string
  'hour': number
  'species_id': number
  'scientific_name': string
  'taxon_id': number
  'taxon': string
  'num_of_recordings': number
}

export interface ArbimonSpecieCallRow {
  'scientific_name': string
  'songtype': string
  'start': string
  'end': string
  'stream_id': string
  'stream_name': string
  'project_id': string
  'project_name': string
  'media_url': string | null
}
