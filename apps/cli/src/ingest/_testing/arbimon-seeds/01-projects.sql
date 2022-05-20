INSERT INTO
    projects (
        project_id,
        name,
        url,
        description,
        project_type_id,
        is_private,
        is_enabled,
        current_plan,
        storage_usage,
        processing_usage,
        pattern_matching_enabled,
        citizen_scientist_enabled,
        cnn_enabled,
        aed_enabled,
        clustering_enabled,
        external_id,
        featured,
        created_at,
        updated_at,
        deleted_at,
        image,
        reports_enabled
    )
VALUES
    (1920, 'RFCx 1', 'rfcx-1', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwi0', 0, '2021-03-18T11:00:00.000Z', '2021-03-18T11:00:00.000Z', NULL, NULL, 1),
    (1921, 'RFCx 2', 'rfcx-2', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwi1', 0, '2021-03-19T11:00:00.000Z', '2021-03-19T11:00:00.000Z', NULL, NULL, 1),
    (1922, 'RFCx 3', 'rfcx-3', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwi2', 0, '2021-03-20T02:00:00.000Z', '2021-03-20T02:00:00.000Z', NULL, NULL, 1),
    (1923, 'RFCx 4', 'rfcx-4', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwi3', 0, '2021-03-20T11:00:00.000Z', '2021-03-20T11:00:00.000Z', NULL, NULL, 1),
    (1924, 'RFCx 5', 'rfcx-5', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwi4', 0, '2021-03-20T12:00:00.000Z', '2021-03-20T12:00:00.000Z', NULL, NULL, 1)
  ;