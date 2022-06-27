create table species (
  species_id int(11) not null,
  scientific_name varchar(100) not null,
  code_name varchar(10) default null,
  taxon_id int(11) not null,
  family_id int(11) default null,
  image varchar(200) default null,
  description text,
  biotab_id int(11) default null,
  defined_by int(10) default null,
  created_at text not null,
  updated_at text not null
);
