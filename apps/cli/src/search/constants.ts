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
    coalesce(location_project_profile.readme, '') as readme,
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

export const SPECIES_IN_PROJECT_SQL = `
  select 
    s.scientific_name, 
    s.common_name, 
    s.taxon_class_slug as taxon_class, 
    r.is_threatened, 
    r.code
  from species_in_project s 
  left join risk_rating_iucn r on r.id = s.risk_rating_id
  where location_project_id = :id`

export const PROJECTS_INDEX_NAME = 'projects'
export const ORGANIZATIONS_INDEX_NAME = 'organizations'
export const SYNC_BATCH_LIMIT = 1000

export const RISK_RATING_EXPANDED: Record<string, string> = {
    NL: 'Not Listed',
    NE: 'Not Evaluated',
    DD: 'Data Deficient',
    LC: 'Least Concern',
    NT: 'Near Threatened',
    VU: 'Vulnerable',
    EN: 'Endangered',
    CR: 'Critically Endangered',
    RE: 'Regionally Extinct',
    EW: 'Extinct in the Wild',
    EX: 'Extinct'
}
