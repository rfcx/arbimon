select a.site_id arbimon_site_id, s.external_id stream_id, s.name, s.lat, s.lon, a.date, a.hour, a.species_id, sp.scientific_name, sp.taxon_id, st.taxon, num_of_recordings from
(select r.site_id, date(r.datetime) date, hour(r.datetime) hour, rv.species_id, rv.songtype_id, count(1) num_of_recordings
from recordings r
    left join recording_validations rv on r.recording_id = rv.recording_id and (rv.present = 1 or rv.present_review > 0)
where r.site_id in (select site_id from sites where project_id = 1989) and r.datetime_utc between '2021-04-01' and '2021-04-08'
group by r.site_id, date(r.datetime), hour(r.datetime), rv.species_id, rv.songtype_id) a
join sites s on a.site_id = s.site_id
join species sp on a.species_id = sp.species_id
join species_taxons st on sp.taxon_id = st.taxon_id;
