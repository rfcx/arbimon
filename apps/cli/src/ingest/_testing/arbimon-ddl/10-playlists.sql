create table playlists (
  playlist_id int not null,
  project_id int not null,
  name varchar(255) not null,
  playlist_type_id int not null,
  uri varchar(255) null,
  metadata text null,
  total_recordings int(11) default 0 null,
  status int(10) default 20 not null
);
