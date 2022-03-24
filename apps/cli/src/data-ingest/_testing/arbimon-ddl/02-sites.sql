CREATE TABLE sites (
  site_id int(10) NOT NULL,
  site_type_id int(10) NOT NULL,
  project_id int(10) NOT NULL,
  name varchar(255) NOT NULL,
  lat double NOT NULL,
  lon double NOT NULL,
  alt double NOT NULL,
  published tinyint(1) NOT NULL DEFAULT '0',
  token_created_on bigint(20) DEFAULT NULL,
  external_id varchar(255) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  timezone varchar(255) NOT NULL,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);