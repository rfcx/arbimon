select p.project_id, p.name, p.url slug, p.description, p.is_private, p.is_enabled, p.external_id core_project_id, p.reports_enabled, s.north, s.east, s.south, s.west
from projects p right join
(
  select Max(s.lon) west, Min(s.lon) east, Min(s.lat) north, Max(s.lat) south, project_id 
  from sites s
  group by project_id 
) s
  on p.project_id = s.project_id
where p.external_id is not null and p.external_id != "undefined";