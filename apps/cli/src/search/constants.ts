export const BASE_SQL = `
  select 
    location_project.id,
    location_project.id_core,
    location_project.id_arbimon,
    location_project.name,
    location_project.slug,
    location_project.status,
    location_project.latitude_north,
    location_project.latitude_south,
    location_project.longitude_east,
    location_project.longitude_west,
    coalesce(location_project_profile.summary, '') as summary,
    location_project_profile.date_start,
    location_project_profile.date_end,
    coalesce(location_project_profile.objectives, '{}') as objectives,
    coalesce(location_project_profile.image, '') as image,
    coalesce(location_project_country.country_codes, '{}') as country_codes,
    coalesce(location_project_metric.species_count, 0) as species_count,
    coalesce(location_project_metric.recording_minutes_count, 0) as recording_minutes_count,
    coalesce(location_project_metric.detection_minutes_count, 0) as detection_minutes_count,
    location_project_metric.min_date,
    location_project_metric.max_date,
    location_project_metric.recording_min_date,
    location_project_metric.recording_max_date,
    location_project_metric.detection_min_date,
    location_project_metric.detection_max_date
  from location_project
  left join location_project_profile on location_project.id = location_project_profile.location_project_id
  left join location_project_country on location_project.id = location_project_country.location_project_id
  left join location_project_metric on location_project.id = location_project_metric.location_project_id
  where `

export const PROJECTS_INDEX_NAME = 'projects'
export const ORGANIZATIONS_INDEX_NAME = 'organizations'
export const SYNC_BATCH_LIMIT = 1000
