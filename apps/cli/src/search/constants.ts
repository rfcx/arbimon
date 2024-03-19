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
    r.code,
    array_agg(distinct ls.country_code) as countries
  from species_in_project s 
  left join risk_rating_iucn r on r.id = s.risk_rating_id
  left join detection_by_site_species_hour d on d.taxon_species_id = s.taxon_species_id and d.location_project_id = s.location_project_id
  left join location_site ls on ls.id = d.location_site_id
  where s.location_project_id = :id
  group by s.scientific_name, s.common_name, s.taxon_class_slug, r.is_threatened, r.code`

export const PROJECTS_INDEX_NAME = 'projects'
export const ORGANIZATIONS_INDEX_NAME = 'organizations'
export const SYNC_BATCH_LIMIT = 1000

export const RISK_RATING_EXPANDED: Record<string, { expanded: string, threatened: boolean }> = {
    NL: { expanded: 'Not Listed', threatened: false },
    NE: { expanded: 'Not Evaluated', threatened: false },
    DD: { expanded: 'Data Deficient', threatened: false },
    LC: { expanded: 'Least Concern', threatened: false },
    NT: { expanded: 'Near Threatened', threatened: true },
    VU: { expanded: 'Vulnerable', threatened: true },
    EN: { expanded: 'Endangered', threatened: true },
    CR: { expanded: 'Critically Endangered', threatened: true },
    RE: { expanded: 'Regionally Extinct', threatened: false },
    EW: { expanded: 'Extinct in the Wild', threatened: false },
    EX: { expanded: 'Extinct', threatened: false }
}
