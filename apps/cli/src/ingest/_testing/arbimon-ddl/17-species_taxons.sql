create table species_taxons (
    taxon_id int not null,
    taxon varchar(30) not null,
    image varchar(30) not null,
    taxon_order int not null,
    enabled tinyint(11) not null
);
