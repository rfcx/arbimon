CREATE TABLE species (
  species_id int(11) NOT NULL,
  scientific_name varchar(100) NOT NULL,
  code_name varchar(10) DEFAULT NULL,
  taxon_id int(11) NOT NULL,
  family_id int(11) DEFAULT NULL,
  image varchar(200) DEFAULT NULL,
  description text,
  biotab_id int(11) DEFAULT NULL,
  defined_by int(10) DEFAULT NUL
);