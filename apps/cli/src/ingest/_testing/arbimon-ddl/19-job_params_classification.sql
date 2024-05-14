create table job_params_classification (
    job_id bigint(20) not null,
    model_id int(10) not null,
    playlist_id int(10) default null,
    name text not null
)