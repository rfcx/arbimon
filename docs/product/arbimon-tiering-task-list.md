# Arbimon Tiering Task List

This task list combines:

- the tiering requirements already summarized in `docs/product/arbimon-tiering-summary.md`
- the current frontend structure in this repo
- the legacy Arbimon SQL schema reviewed from `/Users/tooseriuz/Downloads/arbimon2`

## Key Schema Findings

The current legacy schema does not have first-class support for:

- account tier
- project type
- project active/inactive entitlement state
- project-level minute caps
- project-level PM job caps
- collaborator and guest caps
- downgrade retention state

Relevant existing tables:

- `projects`: only has visibility/privacy-style fields such as `is_private` and public-template flags
- `users`: has `project_limit`, but that is a generic legacy count and does not match the new tier model
- `user_project_role`: maps users to projects and roles, but has no collaborator/guest entitlement fields
- `recordings`: has `duration`, which can be used to compute project usage minutes through `sites.project_id`
- `jobs`: stores jobs by `project_id`, `job_type_id`, `user_id`, and state
- `pattern_matchings`: stores PM jobs separately and is the most direct source for PM quota enforcement
- `recordings_export_parameters`: shows exports are already a distinct queueable workflow
- `user_account_support_request` and `user_account_support_type`: can likely support upgrade/reactivation/contact-us workflows without inventing a completely new request mechanism

## Priority Order

### P0

- `Database 3.1`: add first-class account-tier, project-type, and entitlement-state storage
- `Database 3.2`: define migration/backfill defaults for existing users and projects
- `Database 3.4`: add ownership and paid-slot unlock storage
- `Database 3.5`: add inactive/downgrade state storage
- `Backend API 2.1`: lock canonical entitlement rules and downgrade semantics
- `Backend API 2.2`: build entitlement service layer
- `Backend API 2.3`: build usage calculation services
- `Backend API 2.4`: expose entitlement data in APIs

### P1

- `Backend API 2.5`: enforce project creation rules
- `Backend API 2.6`: enforce project update rules
- `Backend API 2.7`: enforce membership caps
- `Backend API 2.8`: enforce recording-minute caps
- `Backend API 2.10`: enforce inactive-project behavior
- `Backend API 2.11`: implement downgrade processing with user project selection
- `Backend API 2.12`: implement upgrade/reactivation/downgrade request flow
- `Database 3.3`: add usage aggregation strategy objects if needed
- `Database 3.6`: extend support-request storage if needed

### P2

- `Frontend 1.9`: add shared entitlement layer
- `Frontend 1.1`: Account Settings plan/subscription section and downgrade flow
- `Frontend 1.2`: My Projects tier and state summary
- `Frontend 1.3`: Create Project project-type selector and policy UI
- `Frontend 1.4`: Project Settings tier/state/usage presentation
- `Frontend 1.5`: Members quota UI
- `Frontend 1.6`: Dashboard and analysis launcher gating
- `Frontend 1.7`: Import flow usage/cap messaging
- `Frontend 1.8`: export/download UX gating

### P3

- `Backend API 2.9`: PM-job enforcement if kept in scope
- `Backend API 2.13`: staff/support APIs
- `Database 3.7`: export/download audit support
- `Database 3.8`: audit and notification data
- `Database 3.9`: rollout validation queries
- `Frontend 1.10`: frontend tests
- `Backend API 2.14`: backend tests

## Implementation Progress

Completed in repo so far:

- `Database P0`: created Umzug migration drafts for account tier, project type, entitlement state, downgrade selection, and tiering usage views
- `Backend API 2.4`: profile and project responses now expose `accountTier`, `projectType`, `entitlementState`, `viewOnlyEffective`, project tiering usage, and portfolio summary data
- `Backend API 2.5` partial: project creation now accepts `projectType` and enforces tier-based project-type eligibility and active-slot limits
- `Backend API 2.6` partial: free projects cannot be hidden and view-only/inactive projects reject settings edits
- `Backend API 2.7` partial: premium member caps are enforced for collaborators and guests
- `Backend API 2.10` partial: view-only/inactive projects now block CNN job creation, CNN job mutation, review actions, backup/export requests, richness export, and legacy dashboard write paths on the existing API paths
- `Backend API 2.11` partial: downgrade submission now supports user project selection, applies normalized post-downgrade project states, and records downgrade requests/selections
- `Frontend 1.1`: Account Settings now shows the current paid tier, project usage, and an in-page downgrade workflow with project selection
- `Frontend 1.2` partial: My Projects now shows portfolio tier counts plus project-type and active/view-only/inactive badges
- `Frontend 1.3` partial: Create Project now includes a project-type selector, current slot usage, and forces `Free` projects public in the UI
- `Frontend 1.4` partial: Project Settings now shows project entitlement state on the existing page
- `Frontend 1.5` partial: Members page now shows project entitlement context and premium member-cap messaging
- `Frontend 1.6` partial: existing analysis entry points now show view-only restrictions
- `Frontend 1.7` partial: Import Recordings page now shows inactive/view-only messaging
- `Frontend 1.8` partial: existing backup/export surfaces now show inactive/view-only messaging and backend rejections, including species richness source export

Still pending:

- remaining entitlement enforcement on deeper legacy analysis/import/export actions that bypass Bio APIs, especially legacy recordings/sites exports and any remaining direct core/legacy mutation paths
- reactivation and upgrade request workflow beyond downgrade
- staff/support operational APIs and UI
- backend and frontend test expansion in a package-aware test runner setup

## Task List

### 1. Frontend

#### 1.1 Account Settings page

Description:

- Add a `Plan` or `Subscription` section
- Show current paid tier
- Show owned-project usage by type
- Add downgrade action
- Add downgrade review UI without creating a new page
- Let the user choose which projects keep paid slots during downgrade
- Show which projects will become `View-only`

Component areas:

- `apps/website/src/user/account-settings.vue`
- any shared modal/banner components needed for downgrade confirmation

#### 1.2 My Projects page

Description:

- Add account-tier summary
- Add owned-project counts by type
- Add badges for `Free`, `Premium`, `Unlimited`
- Add badges for `Active` and `Inactive`
- Add upgrade/reactivate callouts when caps are hit

Component areas:

- `apps/website/src/projects/my-projects-page.vue`
- project cards and related project list responses

#### 1.3 Create Project page

Description:

- Add project-type selector
- Show eligibility by account tier
- Lock unavailable project types with explanations
- Show portfolio usage and remaining slots
- Force public visibility when `Free` is selected

Component areas:

- `apps/website/src/projects/create-project-page.vue`
- project form components

#### 1.4 Project Settings page

Description:

- Show project type and state
- Show current usage against limits
- Lock visibility for `Free` projects
- Show inactive-project banner and reactivation path

Component areas:

- `apps/website/src/projects/project-settings-page.vue`
- settings form components

#### 1.5 Members page

Description:

- Show collaborator and guest usage counters
- Block adds and role changes when quotas are reached
- Show clear tooltip or inline explanation for the limit

Component areas:

- `apps/website/src/projects/project-member-page.vue`
- member item and role UI

#### 1.6 Dashboard and analysis launcher

Description:

- Show project type, usage, state, and quotas on dashboard
- Filter or disable unavailable analyses
- Replace action buttons with inactive-state messaging where needed

Component areas:

- `apps/website/src/projects/dashboard-page.vue`
- `apps/website/src/projects/components/create-analysis.vue`

#### 1.7 Import flow

Description:

- Surface recording-minute usage before upload/import
- Prevent inactive projects from importing
- Prevent uploads that violate project-type caps if hard enforcement is chosen

Component areas:

- `apps/website/src/_layout/import-recordings/import-recordings.vue`
- any upload-entry pages tied to legacy Arbimon flows

#### 1.8 Export/download UX

Description:

- Audit every export/download surface
- Apply one shared entitlement check and one shared UX pattern

Component areas:

- recordings export
- species export
- sites export
- recording download
- insights export
- CNN export
- backup download

#### 1.9 Shared frontend entitlement layer

Description:

- Add a shared entitlement helper/store model so pages do not each reimplement tier logic
- Keep role permission checks separate from subscription entitlement checks

Component areas:

- API response mapping
- Pinia store / composables
- route/page guards where needed

#### 1.10 Frontend tests

Description:

- Add coverage for project creation rules, visibility rules, collaborator/guest caps, inactive-state guardrails, and export/download gating

### 2. Backend API

#### 2.1 Canonical entitlement rules

Description:

- Lock all steady-state usage limits to `_FINAL_ Published Features.pdf`
- Define exact semantics for:
- `account tier`
- `project type`
- `active` vs `inactive`
- `collaborator` vs `guest`
- `owned project` vs `member access`
- Confirm downgrade behavior that should coexist with the `FINAL` numbers

#### 2.2 Entitlement service layer

Description:

- Build one backend source of truth for portfolio eligibility, project visibility rules, upload rights, PM rights, export/download rights, and inactive-state restrictions

#### 2.3 Usage calculation services

Description:

- Define how project recording minutes are calculated from `recordings.duration`
- Define how collaborator and guest counts are derived from project roles
- Define how PM job count is calculated from `pattern_matchings`
- Define whether deleted or historical data counts

#### 2.4 API response changes

Description:

- Expose account tier, project type, project state, and current usage in API responses
- Expose portfolio entitlement counts for My Projects and Create Project
- Expose page-safe booleans such as:
- `canCreateProjectType`
- `canAddCollaborator`
- `canAddGuest`
- `canUploadRecordings`
- `canRunPatternMatching`
- `canDownloadRecordings`
- `canExportData`

#### 2.5 Project creation enforcement

Description:

- Enforce owned-project portfolio limits by account tier
- Enforce add-on premium unlock behavior for `Pro`
- Enforce project-type selection and visibility policy at create time

#### 2.6 Project update enforcement

Description:

- Prevent settings updates that violate project-type visibility constraints
- Prevent updates on inactive projects where policy disallows changes

#### 2.7 Membership enforcement

Description:

- Block adds and role changes that exceed collaborator or guest caps
- Keep project-role authorization separate from entitlement policy

#### 2.8 Upload and minute-cap enforcement

Description:

- Block uploads or ingestion completion when a project would exceed allowed recording minutes
- Decide whether enforcement is pre-upload, post-upload, or overage-aware

#### 2.9 PM-job enforcement

Description:

- Enforce PM-job limits if product wants them in scope
- Prevent creation of new PM jobs when the cap is reached

#### 2.10 Inactive-project enforcement

Description:

- Prevent inactive projects from importing recordings, creating analyses, expanding memberships, or bypassing policy through edits
- Define what remains available in read-only mode

#### 2.11 Downgrade processing

Description:

- Implement `Enterprise -> Pro`
- Implement `Pro -> Free`
- Decide how `Enterprise -> Free` should work
- Let the user explicitly choose which projects keep paid slots during downgrade
- Automatically mark excess projects as `Inactive`
- Expose those projects as `View-only` in the UI

#### 2.12 Upgrade/reactivation request flow

Description:

- Let users request upgrade to `Pro`
- Let users request upgrade to `Enterprise`
- Let users request additional Premium-project unlocks
- Let users request project reactivation
- Let users submit downgrade requests from Account Settings if downgrade is not fully self-serve

#### 2.13 Admin/support API support

Description:

- Provide staff-facing endpoints or internal support capabilities to inspect tier, usage, project state, and reactivation actions

#### 2.14 Backend tests

Description:

- Add unit and integration coverage for portfolio eligibility, visibility rules, member caps, minute caps, PM caps, downgrade behavior, inactive-project guardrails, and export/download enforcement

### 3. Database

#### 3.1 Add new tiering fields

Description:

- Add first-class storage for account tier
- Add first-class storage for project type
- Add first-class storage for project state such as `active` or `inactive`
- Add storage for unlock/reactivation metadata if needed

Schema implication:

- Existing `projects.sql` and `users.sql` do not have the fields needed for this feature

#### 3.2 Migration and backfill plan

Description:

- Decide default tier assignment for all existing accounts
- Decide default project type for all existing projects
- Decide how to classify existing projects that already exceed the new limits
- Decide whether historical PM jobs and recording minutes immediately count

#### 3.3 Usage aggregation strategy

Description:

- Decide whether usage is computed on read or materialized
- If materialized, add tables or cached metrics needed for:
- recording-minute totals by project
- collaborator count by project
- guest count by project
- PM-job totals by project

#### 3.4 Ownership and unlock storage

Description:

- Add data structures needed to represent:
- owned project entitlements by type
- additional Premium-project unlocks
- downgrade retention/reactivation state

#### 3.5 Inactive/downgrade state storage

Description:

- Add a durable way to mark projects inactive for entitlement reasons
- Add enough metadata to explain why a project is inactive and how it can be reactivated
- Store downgrade-selection outcomes so the chosen retained projects are explicit and reproducible

#### 3.6 Support-request reuse or extension

Description:

- Decide whether `user_account_support_request` and `user_account_support_type` should be extended for upgrade/reactivation requests
- Add any missing support types or parameters needed for the new flows

#### 3.7 Export/download enforcement support

Description:

- Add any database-level markers or queue metadata needed to reject or audit export/download requests based on entitlement

#### 3.8 Audit and notification data

Description:

- Add storage for tier changes, downgrade events, reactivation events, and manual overrides if current audit tables are not sufficient

#### 3.9 Database migration scripts and validation queries

Description:

- Write migrations
- Write backfill scripts
- Write validation queries to confirm counts, state transitions, and entitlement correctness after rollout

## Recommended Delivery Order

1. Database design and migration plan.
2. Backend API entitlement model and enforcement.
3. Frontend updates on existing pages.
4. Downgrade/reactivation operations.
5. Export/download enforcement.
6. Test coverage and rollout validation.

## Biggest Risks

- Mixing old role permissions with new subscription entitlements
- Underestimating how many legacy flows bypass the new frontend and still hit the old Arbimon stack
- Counting usage inconsistently between frontend, API, and legacy SQL
- Ambiguous mapping from project roles to collaborator/guest quotas
- No clear source of truth yet for downgrade/reactivation ordering if too many projects exist after a tier change
