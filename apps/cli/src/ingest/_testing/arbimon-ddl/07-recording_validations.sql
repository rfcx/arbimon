CREATE TABLE recording_validations (
  recording_validation_id bigint,
  recording_id bigint not null,
  project_id int not null,
  user_id int not null,
  species_id int not null,
  songtype_id int not null,
  present tinyint(1) null,
  present_review int default 0 not null,
  present_aed int default 0 not null,
  created_at datetime not null default current_timestamp,
  updated_at datetime not null default current_timestamp
);
