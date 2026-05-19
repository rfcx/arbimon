BEGIN;

CREATE OR REPLACE VIEW location_project_member_quota_usage AS
SELECT
  lpur.location_project_id,
  COUNT(*) FILTER (WHERE lpur.role_id = 3) AS guest_count,
  COUNT(*) FILTER (WHERE lpur.role_id NOT IN (3, 4)) AS collaborator_count
FROM location_project_user_role lpur
GROUP BY lpur.location_project_id;

COMMENT ON VIEW location_project_member_quota_usage IS 'Per-project collaborator and guest counts derived from location_project_user_role. Recording-minute and job usage stay in legacy.';

COMMIT;
