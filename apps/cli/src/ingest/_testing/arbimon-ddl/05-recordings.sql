create table recordings (
  recording_id bigint(20) not null,
  site_id int(10) not null,
  uri varchar(255) not null,
  datetime datetime not null,
  mic varchar(255) not null,
  recorder varchar(255) not null,
  version varchar(255) not null,
  sample_rate mediumint(8) default null,
  precision tinyint(3) default null,
  duration float default null,
  samples bigint(20) default null,
  file_size bigint(45) default null,
  bit_rate varchar(45) default null,
  sample_encoding varchar(45) default null,
  upload_time datetime default null,
  meta text,
  datetime_utc datetime default null
);