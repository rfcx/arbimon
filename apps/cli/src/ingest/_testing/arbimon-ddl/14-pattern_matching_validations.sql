create table pattern_matching_validations (
    validation_id int not null,
    pattern_matching_roi_id int not null,
    user_id int not null,
    timestamp timestamp not null,
    validated int null
);
