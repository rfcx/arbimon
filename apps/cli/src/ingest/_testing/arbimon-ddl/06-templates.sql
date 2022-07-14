create table templates (
  template_id int(11) not null,
  project_id int(10) not null,
  recording_id bigint(20) not null,
  species_id int(11) not null,
  songtype_id int(11) not null,
  name varchar(255) not null,
  uri varchar(255) default null,
  x1 double not null,
  y1 double not null,
  x2 double not null,
  y2 double not null,
  date_created timestamp null default null,
  deleted tinyint(1) default '0',
  source_project_id int(10) default null,
  user_id int(10) default null
);
