# Arbimon Legacy Tiering Task List

This task list is for `/Users/tooseriuz/Github/arbimon-legacy`.

Assumptions:

- the legacy database is the operational source of truth for most project/user data
- legacy currently enforces `role`, but not `plan`
- tiering enforcement in legacy should block write/export/analysis actions when a project is `inactive` or `view-only`
- read-only routes can remain accessible

## 1. Database

### 1.1 Add canonical tiering fields to legacy tables

Description:

- add account-tier fields on `users`
- add project-type and entitlement-state fields on `projects`
- add timestamps/reason fields needed for downgrade and reactivation flows

Target tables:

- `users`
- `projects`

Suggested fields:

- `users.account_tier`
- `users.account_tier_updated_at`
- `users.additional_premium_project_slots`
- `projects.project_type`
- `projects.entitlement_state`
- `projects.view_only_effective`
- `projects.downgrade_locked`
- `projects.entitlement_updated_at`
- `projects.entitlement_inactivated_reason`

Migration location:

- `arbimon-legacy/db/init/0xx-*.sql`

### 1.2 Add downgrade tracking tables

Description:

- store downgrade requests and the user’s selected projects
- preserve which projects stayed active and which became inactive

Target tables:

- new `account_tier_change_request`
- new `account_tier_change_project_selection`

### 1.3 Add usage aggregation support

Description:

- add SQL views or reporting queries to calculate:
- owned active project counts by type
- recording-minute usage per project
- collaborator and guest counts
- PM job counts if still enforced

Likely sources:

- `projects`
- `sites`
- `recordings`
- `user_project_role`
- `pattern_matchings`

### 1.4 Backfill existing data

Description:

- default existing users to `free`
- default existing projects to `free` + `active`
- set `view_only_effective = 0` for existing rows

### 1.5 Define sync contract with Bio/UI repo

Description:

- decide whether this repo reads tiering directly from legacy DB, mirrored APIs, or sync tables
- keep one canonical meaning for `project_type`, `entitlement_state`, and `view_only_effective`

## 2. Backend

### 2.1 Add entitlement loading to the shared project context

Description:

- extend the shared project loader in `app/routes/data-api/project/index.js`
- ensure `req.project` includes tiering fields for downstream routes

Primary file:

- `/Users/tooseriuz/Github/arbimon-legacy/app/routes/data-api/project/index.js`

### 2.2 Add shared plan-check helpers

Description:

- add reusable checks for:
- write actions
- export actions
- analysis actions

Expected behavior:

- block if `projects.entitlement_state = 'inactive'`
- block if `projects.view_only_effective = 1`

Suggested helper shape:

- `assertProjectPlanAllowsWrite(req.project)`
- `assertProjectPlanAllowsExport(req.project)`
- `assertProjectPlanAllowsAnalysis(req.project)`

### 2.3 Enforce plan on project settings and membership routes

Description:

- add plan checks to project mutation routes that already use role checks

Routes/files:

- `/:projectUrl/info/update`
- `/:projectUrl/user/add`
- `/:projectUrl/user/role`
- `/:projectUrl/user/del`
- `app/routes/data-api/project/index.js`

### 2.4 Enforce plan on sites routes

Description:

- block create/update/delete/export for inactive or view-only projects

Routes/files:

- `/:projectUrl/sites/create`
- `/:projectUrl/sites/update`
- `/:projectUrl/sites/delete`
- `/:projectUrl/sites-export.csv`
- `app/routes/data-api/project/sites.js`
- `app/routes/data-api/project/index.js`

### 2.5 Enforce plan on recordings routes

Description:

- block validation, delete, delete-matching, export parameter writes, and any direct export/download actions if those should be unavailable in view-only mode

Routes/files:

- `/:projectUrl/recordings/validate/:oneRecUrl?`
- `/:projectUrl/recordings/delete`
- `/:projectUrl/recordings/delete-matching`
- `/:projectUrl/recordings/pm-export`
- `/:projectUrl/recordings/project-template-export`
- `/:projectUrl/recordings/project-soundscape-export`
- `/:projectUrl/recordings/project-rfm-classify-export`
- `/:projectUrl/recordings/download/:id` if download should be blocked too
- `app/routes/data-api/project/recordings.js`

### 2.6 Enforce plan on species and template routes

Description:

- block project-species and template mutations for inactive or view-only projects

Routes/files:

- `/:projectUrl/class/recognize`
- `/:projectUrl/class/bulk-add`
- `/:projectUrl/class/add`
- `/:projectUrl/class/del`
- `/:projectUrl/species-export.csv`
- `app/routes/data-api/project/templates.js`
- `/:projectUrl/templates/add`
- `app/routes/data-api/project/index.js`

### 2.7 Enforce plan on playlist routes

Description:

- block create/update/delete style playlist operations when the project is view-only

Primary file:

- `app/routes/data-api/project/playlists.js`

### 2.8 Enforce plan on legacy analysis routes

Description:

- block new/update/remove/validate actions for legacy analysis modules when the project is inactive or view-only

Primary files:

- `app/routes/data-api/project/pattern_matchings.js`
- `app/routes/data-api/project/audio-event-detections-clustering.js`
- `app/routes/data-api/project/clustering-jobs.js`
- `app/routes/data-api/project/soundscape-composition.js`
- `app/routes/data-api/project/soundscapes.js`
- `app/routes/data-api/project/training_sets.js`
- `app/routes/data-api/project/classifications.js`
- `app/routes/data-api/models.js`

### 2.9 Add downgrade and reactivation services in legacy

Description:

- add legacy-side service logic to:
- apply downgrade selections
- mark projects inactive/view-only
- reactivate eligible projects after upgrade

This should use the canonical tiering tables in the legacy DB.

### 2.10 Add plan-aware responses for frontend consumption

Description:

- expose enough project/user tiering state for the UI repo to render consistent gating and messaging
- avoid requiring the frontend to guess entitlement from role-only responses

## 3. Priority

### P0

- `1.1` add canonical tiering fields to legacy tables
- `1.2` add downgrade tracking tables
- `1.4` backfill existing data
- `2.1` add entitlement loading to shared project context
- `2.2` add shared plan-check helpers
- `2.3` enforce plan on project settings and membership routes

### P1

- `2.4` sites routes
- `2.5` recordings routes
- `2.6` species and template routes
- `2.7` playlist routes
- `2.8` legacy analysis routes

### P2

- `1.3` usage aggregation support
- `2.9` downgrade and reactivation services
- `2.10` plan-aware frontend-facing responses

### P3

- tests for each route family
- operational/admin tooling for support workflows
- cleanup/refactor to reduce repeated route-level checks

## 4. Main Design Decision

Before implementation, legacy needs one explicit decision:

- should entitlement state be stored directly in legacy tables and enforced locally
- or should legacy ask another service for entitlement state on each request

Given the current architecture, storing canonical tiering state in the legacy DB is the cleaner path.
