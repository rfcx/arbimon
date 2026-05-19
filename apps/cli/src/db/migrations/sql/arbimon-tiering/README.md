# Arbimon Tiering SQL Migration Drafts

These SQL files are priority-ordered migration drafts for the Arbimon tiering work.

They are based on the current Bio/Postgres schema used by this repo:

- `user_profile`
- `location_project`
- `location_project_user_role`

They are not wired into the existing Umzug TypeScript migration runner yet. They are intended as the database design source material for the first migration pass.

Execution order:

1. `001_account_tier_and_project_type.sql`
2. `002_project_entitlement_state.sql`
3. `004_usage_views.sql`
4. `005_backfill_defaults.sql`

Notes:

- Bio/Postgres owns account tiers, add-on slots, project types, and project lock state.
- Project locking is represented by a single `location_project.is_locked` column.
- `004_usage_views.sql` now only provides collaborator/guest quota usage from Bio membership data.
