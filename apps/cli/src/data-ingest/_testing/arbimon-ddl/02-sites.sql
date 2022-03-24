create table sites (
  site_id int(10) not null,
  site_type_id int(10) not null,
  project_id int(10) not null,
  name varchar(255) not null,
  lat double not null,
  lon double not null,
  alt double not null,
  published tinyint(1) not null default '0',
  token_created_on bigint(20) default null,
  external_id varchar(255) default null,
  created_at timestamp null default current_timestamp,
  timezone varchar(255) not null,
  updated_at datetime not null default current_timestamp
);