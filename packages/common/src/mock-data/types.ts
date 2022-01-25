export interface MockHourlyDetectionSummary {
  'site_id': number // siteId
  'stream_id': string // siteIdCore
  'arbimon_site_id': number // siteIdArbimon
  'name': string
  'lat': number
  'lon': number
  'alt': number
  'date': string // ex: "2021-04-01T00:00:00.000Z"
  'hour': number
  'species_id': number
  'scientific_name': string
  'taxon_id': number
  'taxon': string
  'num_of_recordings': number
  'detection_frequency': number
}
