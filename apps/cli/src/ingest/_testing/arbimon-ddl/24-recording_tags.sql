CREATE TABLE recording_tags (
  recording_tag_id int(20) NOT NULL,
  recording_id int(20) NOT NULL,
  tag_id int(10) NOT NULL,
  user_id int(10) NOT NULL,
  datetime datetime NOT NULL,
  t0 float DEFAULT NULL,
  f0 float DEFAULT NULL,
  t1 float DEFAULT NULL,
  f1 float DEFAULT NULL,
  site_id int(10) DEFAULT NULL
)
