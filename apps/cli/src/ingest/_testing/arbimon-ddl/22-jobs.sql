CREATE TABLE jobs (
  job_id bigint(20) not null,
  job_type_id int(10) not null,
  date_created datetime not null,
  last_update datetime not null,
  project_id int(10) not null,
  user_id int(10) not null,
  uri varchar(255) not null,
  state varchar(60) not null,
  cancel_requested int(11) not null,
  progress double not null,
  completed tinyint(1) not null,
  remarks text not null,
  progress_steps int(11) not null,
  hidden tinyint(4) not null,
  ncpu int(11) not null
)
