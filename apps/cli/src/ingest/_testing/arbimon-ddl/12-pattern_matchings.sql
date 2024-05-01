create table pattern_matchings (
  pattern_matching_id int not null,
  name varchar(255) not null,
  project_id int not null,
  timestamp timestamp not null,
  species_id int not null,
  songtype_id int not null,
  parameters text not null,
  playlist_id int null,
  template_id int null,
  completed tinyint(1) default 0 not null,
  deleted tinyint(1) default 0 not null,
  job_id bigint null,
  citizen_scientist tinyint(1) default 0 not null,
  consensus_number int default 3 not null,
  cs_expert tinyint(1) not null
);
