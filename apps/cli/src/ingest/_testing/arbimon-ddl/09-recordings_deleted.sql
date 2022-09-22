create table recordings_deleted (
  recording_id bigint(20) not null,
  site_id int(10) not null,
  datetime datetime not null,
  duration float default null,
  samples bigint(20) default null,
  deleted_at datetime not null default current_timestamp
);
