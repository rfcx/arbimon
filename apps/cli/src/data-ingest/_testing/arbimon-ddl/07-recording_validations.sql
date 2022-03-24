CREATE TABLE templates (
  template_id int(11) NOT NULL,
  project_id int(10) NOT NULL,
  recording_id bigint(20) NOT NULL,
  species_id int(11) NOT NULL,
  songtype_id int(11) NOT NULL,
  name varchar(255) NOT NULL,
  uri varchar(255) DEFAULT NULL,
  x1 double NOT NULL,
  y1 double NOT NULL,
  x2 double NOT NULL,
  y2 double NOT NULL,
  date_created timestamp NULL DEFAULT NULL,
  deleted tinyint(1) DEFAULT '0',
  source_project_id int(10) DEFAULT NULL,
  user_id int(10) DEFAULT NULL
);