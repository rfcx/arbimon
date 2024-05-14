create table classification_results (
    classification_result_id int(10) not null,
    job_id int(11) not null,
    recording_id int(11) not null,
    species_id int(11) not null,
    songtype_id int(11) not null,
    present tinyint(4) not null,
    max_vector_value float default null,
    min_vector_value float default null
)