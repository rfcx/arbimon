create table models (
    model_id int(10) not null,
    name varchar(255) not null,
    model_type_id int(10) not null,
    uri varchar(255) not null,
    date_created datetime not null,
    project_id int(10) not null,
    user_id int(10) not null,
    training_set_id bigint(20) not null,
    validation_set_id int(11) not null,
    deleted tinyint(4) not null default '0',
    threshold float default null
)