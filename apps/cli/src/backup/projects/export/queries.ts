export const SITES = `
    select site_id, name, lat latitude, lon longitude, alt elevation, timezone, country_code, hidden, created_at
    from sites
    where project_id = $projectId and deleted_at is null
    order by site_id asc
`
export const SPECIES = `
    select s.species_id, s.scientific_name, sf.family, t.taxon, st.songtype_id, st.songtype 
    from project_classes pc 
       join species s on s.species_id = pc.species_id 
       join songtypes st on pc.songtype_id = st.songtype_id 
       join species_families sf on s.family_id = sf.family_id 
       join species_taxons t on s.taxon_id = t.taxon_id 
    where project_id = $projectId
`

export const RECORDINGS = `
    select recording_id, site_id, datetime, datetime_utc, sample_rate, duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, uri path
    from recordings
    where site_id in (select site_id from sites where project_id = $projectId)
    order by recording_id asc
`

export const PLAYLISTS = `
    select *
    from playlists
    where project_id = $projectId
    order by playlist_id asc
`

export const PLAYLIST_RECORDINGS = `
    select * 
    from playlist_recordings
    where playlist_id in (select playlist_id from playlists where project_id = $projectId)
`

export const TEMPLATES = `
    select
      t.template_id, t.recording_id, t.species_id, t.songtype_id, 
      t.name, t.x1, t.y1, t.x2, t.y2, t.date_created, p.name source_project_name,
      t.uri path
    from templates t left join projects p on t.source_project_id = p.project_id
    where t.project_id = $projectId
`

export const RECORDING_VALIDATIONS = `
    select *
    from recording_validations
    where project_id = $projectId
`

export const PATTERN_MATCHINGS = `
    select *
    from pattern_matchings
    where project_id = $projectId
`

export const PATTERN_MATCHING_ROIS = `
    select pattern_matching_roi_id, pattern_matching_id, recording_id, species_id, songtype_id, 
       x1, y1, x2, y2, score, validated,
       uri path
    from pattern_matching_rois
    where pattern_matching_id in (select pattern_matching_id from pattern_matchings where project_id = $projectId)
`

export const PATTERN_MATCHING_VALIDATIONS = `
    select *
    from pattern_matching_validations
    where pattern_matching_roi_id in 
       (select pattern_matching_roi_id from pattern_matching_rois where pattern_matching_id in 
           (select pattern_matching_id from pattern_matchings where project_id = $projectId ))
`

export const SOUNDSCAPES = `
   select *
   from soundscapes
   where project_id = $projectId
`

export const CLASSIFICATIONS = `
   select cr.* 
   from classification_results cr
       join job_params_classification jpc on cr.job_id = jpc.job_id 
       join models m on jpc.model_id = m.model_id 
   where m.model_type_id  = 4 and m.project_id = $projectId
`
