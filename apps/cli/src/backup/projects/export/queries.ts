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
    select playlist_id, name, playlist_type_id, metadata, total_recordings
    from playlists
    where project_id = $projectId
    order by playlist_id asc
`

export const PLAYLIST_RECORDINGS = `
    select pr.playlist_id, p.name playlist_name, pr.recording_id
    from playlist_recordings pr
        join playlists p on pr.playlist_id = p.playlist_id
        join recordings r on pr.recording_id = r.recording_id
    where pr.playlist_id in (select playlist_id from playlists where project_id = $projectId)
`

export const TEMPLATES = `
    select
        t.template_id, t.name template_name, t.recording_id, t.species_id, s.scientific_name, t.songtype_id, st.songtype, 
        t.x1, t.y1, t.x2, t.y2, t.date_created, p.name source_project_name,
        t.uri path
    from templates t 
        join projects p on t.source_project_id = p.project_id
        join species s on t.species_id = s.species_id 
        join songtypes st on t.songtype_id = st.songtype_id 
    where t.project_id = $projectId
`

export const RECORDING_VALIDATIONS = `
    select recording_validation_id, recording_id, rv.species_id, s.scientific_name, rv.songtype_id, st.songtype, user_id, present, present_review, present_aed, rv.created_at, rv.updated_at
    from recording_validations rv
        join species s on rv.species_id = s.species_id 
        join songtypes st on rv.songtype_id = st.songtype_id
    where project_id = $projectId
`

export const PATTERN_MATCHINGS = `
    select pattern_matching_id, pm.name, timestamp, pm.playlist_id, p.name playlist_name, pm.template_id, t.name template_name, parameters, completed
    from pattern_matchings pm
        join playlists p on pm.playlist_id = p.playlist_id
        join templates t on pm.template_id = t.template_id
    where pm.project_id = $projectId and pm.deleted = 0
`

export const PATTERN_MATCHING_ROIS = `
    select pattern_matching_roi_id, pmr.pattern_matching_id, pm.name pattern_matching_name, recording_id, pmr.species_id, s.scientific_name, pmr.songtype_id, st.songtype,
        x1, y1, x2, y2, score, validated
    from pattern_matching_rois pmr
        join pattern_matchings pm on pmr.pattern_matching_id = pm.pattern_matching_id
        join species s on pmr.species_id = s.species_id 
        join songtypes st on pmr.songtype_id = st.songtype_id
    where pmr.pattern_matching_id in (select pattern_matching_id from pattern_matchings where project_id = $projectId)
`

export const SOUNDSCAPES = `
    select soundscape_id, s.name, s.playlist_id, p.name playlist_name, date_created, user_id, sat.identifier aggregation_type, 
        bin_size, frequency, threshold, threshold_type, normalized, min_t min_time_bucket, max_t max_time_bucket, 
        max_f max_frequency, s.uri path
    from soundscapes s 
        join soundscape_aggregation_types sat on s.soundscape_aggregation_type_id = sat.soundscape_aggregation_type_id
        join playlists p on s.playlist_id = p.playlist_id
    where s.project_id = $projectId
`

export const RFM_MODELS = `
    select model_id, name, date_created, user_id 
    from models where model_type_id = 4 and project_id = $projectId
`

export const RFM_CLASSIFICATIONS = `
    select cr.classification_result_id, m.model_id, m.name as model_name, cr.recording_id, cr.species_id, sp.name as species_name, cr.songtype_id, st.songtype, cr.present
    from classification_results cr
        join job_params_classification jpc on cr.job_id = jpc.job_id 
        join models m on jpc.model_id = m.model_id 
        join songtypes st on cr.songtype_id = st.songtype_id
        join species sp on cr.species_id = sp.species_id
    where m.model_type_id = 4 and m.project_id = $projectId
`
