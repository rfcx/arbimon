export interface ArbimonProject {
  'project_id': number
  'core_project_id': string
  'slug': string
  'name': string
  'description': string | null
  'is_private': boolean
  'reports_enabled': boolean
  'north': number
  'south': number
  'west': number
  'east': number
}
