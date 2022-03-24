CREATE TABLE recordings (
  recording_id bigint(20) NOT NULL,
  site_id int(10) NOT NULL,
  uri varchar(255) NOT NULL,
  datetime datetime NOT NULL,
  mic varchar(255) NOT NULL,
  recorder varchar(255) NOT NULL,
  version varchar(255) NOT NULL,
  sample_rate mediumint(8) DEFAULT NULL,
  precision tinyint(3) DEFAULT NULL,
  duration float DEFAULT NULL,
  samples bigint(20) DEFAULT NULL,
  file_size bigint(45) DEFAULT NULL,
  bit_rate varchar(45) DEFAULT NULL,
  sample_encoding varchar(45) DEFAULT NULL,
  upload_time datetime DEFAULT NULL,
  meta text,
  datetime_utc datetime DEFAULT NULL
);