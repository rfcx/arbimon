select sp.scientific_name, st.songtype, DATE_ADD(r.datetime_utc, interval t.x1 second) start, DATE_ADD(r.datetime_utc, interval t.x2 second) "end", t.recording_id, s.external_id stream_id, s.name stream_name, s.timezone, p.external_id project_id, p.name project_name, p.url project_slug
from templates t 
	join recordings r on t.recording_id = r.recording_id 
	join species sp on t.species_id = sp.species_id 
	join songtypes st on t.songtype_id = st.songtype_id 
	join sites s on r.site_id = s.site_id 
	join projects p on s.project_id = p.project_id 
where t.project_id = 1989 and t.deleted != 1 and r.datetime_utc is not null;