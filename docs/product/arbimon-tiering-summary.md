# Arbimon Tiering Summary

This note consolidates the requirements from:

- `/Users/tooseriuz/Downloads/Arbimon Tiers - _FINAL_ Published Features.pdf`
- `/Users/tooseriuz/Downloads/Arbimon Tiers - Downgrade Protocol.pdf`

It also maps those requirements onto the current frontend entry points in this repo.

## 1. Source Of Truth

The user confirmed that usage limits must follow:

- `/Users/tooseriuz/Downloads/Arbimon Tiers - _FINAL_ Published Features.pdf`

This summary now treats the `FINAL` numbers as the target product rules. Any conflicting numbers from the downgrade PDF should not be used as entitlement limits.

## 2. Canonical Product Rules

### Account tiers

- `Free`: `5 Free projects`
- `Pro`: `50 Free projects`, `2 Premium projects`
- `Enterprise`: `Unlimited Free projects`, `Unlimited Premium projects`, `1 Unlimited project`

### Project types

- `Free`: less than `40,000` minutes, public project only
- `Premium`: up to `1,000,000` minutes, up to `4 collaborators`, up to `3 guests`, public or private
- `Unlimited`: unlimited recording minutes, unlimited collaborators, unlimited guests, public or private

### Account-level feature access

- `Free`: unable to download recordings
- `Pro`: download/export allowed, can unlock additional Premium projects at `$99/year per Premium Project`
- `Enterprise`: download/export allowed, dedicated enterprise manager, custom package for additional project capacity

## 3. Remaining Clarifications

These are not number conflicts anymore, but they still need explicit confirmation before implementation:

- exact inactive-project behavior after downgrade
- whether export restrictions for `Free` apply only to recording download or to all exports

## 4. Working Domain Model

The requirements introduce two different concepts:

- `Account tier`: `Free`, `Pro`, `Enterprise`
- `Project type`: `Free`, `Premium`, `Unlimited`

The platform behavior is mostly driven by `project type`, while portfolio allowances are driven by `account tier`.

Suggested additional fields for implementation:

- `accountTier`
- `projectType`
- `projectState`: `active` or `inactive`
- `usageMinutes`
- `patternMatchingJobCount`
- `collaboratorCount`
- `guestCount`
- `canDownload`
- `canExport`
- `canUnlockAdditionalPremiumProjects`
- `portfolioEntitlements`

## 5. What Each Project Type Can And Cannot Do

### Free Project

Can do:

- Stay under `40,000` recorded minutes
- Remain publicly accessible
- Exist under all three account tiers

Cannot do:

- Be private
- Exceed the free-project recording-minute cap
- Exist under a downgraded account if it falls outside the retained active-project allowance

Use for implementation:

- `< 40,000` recorded minutes
- public project only

Do not use conflicting downgrade-PDF limits for this project type unless later confirmed.

### Premium Project

Can do:

- Stay under `1,000,000` recorded minutes
- Be public or private
- Support limited collaborator capacity
- Be owned by `Pro` and `Enterprise`

Cannot do:

- Exist under `Free`
- Exceed the premium-project recording-minute cap
- Exceed collaborator limits
- Stay active after downgrade if it is outside the retained premium-project allowance

Use for implementation:

- `<= 1,000,000` recorded minutes
- `4 collaborators`
- `3 guests`
- public and private projects

### Unlimited Project

Can do:

- Use unlimited recording minutes
- Be public or private
- Support unlimited collaborators and guests, or at minimum unlimited collaborators
- Support unlimited PM jobs if the downgrade PDF is authoritative

Cannot do:

- Exist under `Free`
- Exist under `Pro`
- Remain active after downgrade away from `Enterprise`

## 6. What Each Account Tier Can And Cannot Do

### Free Account

Can do:

- Own `Free` projects only
- Keep a small active portfolio of `Free` projects
- Participate in projects owned by other users as a collaborator/member

Cannot do:

- Own `Premium` projects
- Own `Unlimited` projects
- Use private visibility for owned projects
- Access full download/export privileges
- Unlock additional premium projects

Portfolio limits:

- `5 Free projects`

Downgrade outcome into Free:

- Keep functionality on last `5` active `Free` projects
- All `Premium` projects become `Inactive`
- `Unlimited` projects are not allowed and should already be inactive before landing here
- Option to unlock extra premium projects is lost
- Export/download becomes limited or restricted

### Pro Account

Can do:

- Own `Free` and `Premium` projects
- Buy additional `Premium` projects at `$99/year` each
- Use download/export
- Keep private projects through `Premium`

Cannot do:

- Own `Unlimited` projects
- Keep downgraded `Unlimited` projects active

Portfolio limits:

- `50 Free`
- `2 Premium`

Downgrade outcome from Enterprise to Pro:

- User should be able to choose which projects remain in paid slots during downgrade
- Projects outside the downgraded entitlement should become `Inactive`
- All `Unlimited` projects become `Inactive`
- Dedicated Enterprise Manager is handed off to CSM
- Additional Premium projects can still be reactivated at `$99/year`

Downgrade outcome from Pro to Free:

- User should be able to choose which projects stay within the allowed downgraded `Free` allocation
- All `Premium` projects that cannot be retained should become `Inactive`
- Lose option to unlock additional Premium projects
- Download/export is reduced to Free limits
- CRM priority is reduced

### Enterprise Account

Can do:

- Own `Free`, `Premium`, and `Unlimited` projects
- Use download/export
- Have a Dedicated Enterprise Manager
- Use a custom package for additional project capacity

Cannot do:

- Keep `Unlimited` projects active after downgrade to `Pro` or `Free`

Portfolio limits:

- `Unlimited Free`
- `Unlimited Premium`
- `1 Unlimited`

## 7. Downgrade Cases To Support

### Enterprise -> Pro

- Retain only the allowed active subset
- Let the user choose which projects keep paid slots during downgrade
- All `Unlimited` projects become `Inactive`
- DEM is removed and handed to CSM
- User can still reactivate additional Premium projects via paid add-on

### Pro -> Free

- Retain only the allowed active subset
- Let the user choose which projects stay active within the downgraded limits
- All `Premium` projects become `Inactive`
- Unlock-extra-premium option disappears
- Download/export becomes restricted
- CRM priority is reduced

### Enterprise -> Free

This path is not explicitly described as a direct downgrade flow in the PDFs.

Two implementation-safe options:

- Model it as `Enterprise -> Pro -> Free` sequentially
- Add an explicit product rule for direct downgrade, because the retained active set is currently undefined

### Inactive Project Behavior

The downgrade PDF repeatedly says surplus projects toggle to `Inactive`.

That implies an additional state with restricted behavior. At minimum, inactive projects should not allow:

- New uploads
- New analyses
- Member expansion
- Visibility/privacy changes that bypass tier rules
- Download/export if the target tier disallows it

Likely still allowed:

- Viewing project metadata
- Reviewing why the project is inactive
- Reactivating if the account still has entitlement or the user pays to unlock

Suggested terminology:

- `View-only` in the UI
- `Inactive` in the backend entitlement model

That lets the product communicate the user-facing effect clearly while preserving a stricter internal state.

## 8. Current Frontend Touchpoints

### Project creation

Current page: [apps/website/src/projects/create-project-page.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/projects/create-project-page.vue:1)

Current behavior:

- Collects name, objectives, dates, and public/hidden flag
- Sends only `name`, `hidden`, `objectives`, `dateStart`, `dateEnd`
- Has no tier, project-type, quota, or eligibility logic

Gap:

- No way to choose `Free` / `Premium` / `Unlimited`
- No way to explain why `Free` must be public
- No portfolio-cap check before submit

### My Projects

Current page: [apps/website/src/projects/my-projects-page.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/projects/my-projects-page.vue:1)

Current behavior:

- Lists cards and lets the user create projects
- Has no portfolio summary, no quota usage, no inactive state, and no tier badges

Gap:

- No place to explain remaining project slots
- No way to distinguish `Free`, `Premium`, `Unlimited`, or `Inactive`

### Project settings

Current page: [apps/website/src/projects/project-settings-page.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/projects/project-settings-page.vue:1)

Current behavior:

- Manages name, dates, summary, objectives, slug, image, public/private, backup, delete
- Visibility is controlled only by `isPublic`

Gap:

- No project-type identity
- No downgrade state
- No limit messaging
- No visibility lock for `Free` projects

### Members

Current page: [apps/website/src/projects/project-member-page.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/projects/project-member-page.vue:1)

Current behavior:

- Lets admins add members and assign roles
- Has `Guest` as a role, but no collaborator/guest quota logic

Gap:

- No count of current collaborators vs allowed collaborators
- No count of guests vs allowed guests
- No disabled add-member flow when the project hits its cap

### Dashboard analysis launcher

Current pages:

- [apps/website/src/projects/dashboard-page.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/projects/dashboard-page.vue:1)
- [apps/website/src/projects/components/create-analysis.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/projects/components/create-analysis.vue:1)

Current behavior:

- Shows a generic `Create new analysis` action
- Offers PM, Soundscapes, AED, and RFM uniformly
- No project-type restriction, no PM quota, no inactive-project block

Gap:

- No entitlement check before opening legacy analysis links
- No PM-job counter for the Free/Premium/Unlimited rules

### Import recordings

Current page: [apps/website/src/_layout/import-recordings/import-recordings.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/_layout/import-recordings/import-recordings.vue:1)

Current behavior:

- Pure download/install page for the uploader
- No recording-minute usage information

Gap:

- No visibility into remaining minutes for `Free` or `Premium`
- No warning that uploads could push a project into an invalid state

### Sidebar and navigation

Current page: [apps/website/src/_layout/components/side-bar/side-bar.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/_layout/components/side-bar/side-bar.vue:1)

Current behavior:

- Exposes import, explore, analyses, insights, settings
- Hides some routes only by membership or internal-user logic

Gap:

- No inactive-project guardrails
- No tier-aware locking for project-level actions

### Account Settings

Current page: [apps/website/src/user/account-settings.vue](/Users/tooseriuz/Github/arbimon/apps/website/src/user/account-settings.vue:1)

Current behavior:

- User account settings already exist
- There is currently no section for plan/subscription management

Gap:

- No visible indicator of the user’s current paid tier
- No downgrade initiation flow
- No downgrade review flow where the user picks which projects keep paid slots
- No explanation of which projects will become view-only/inactive after downgrade

### Export and download

Current frontend already exposes export/download in multiple places:

- recordings
- sites
- species
- visualizer recording download
- CNN export
- insights CSV/PNG export
- project backup

Gap:

- Export and download are currently role-based, not tier-based
- Free-tier restrictions will need a shared entitlement layer, otherwise enforcement will be inconsistent

## 9. Minimal UI Changes Without Adding New Pages

### My Projects

- Add account-tier badge near page title
- Add portfolio summary strip:
- `Free: 4/5 active`
- `Premium: 1/2 active`
- `Unlimited: 0/1 active`
- Add project card badges:
- `Free`, `Premium`, `Unlimited`
- `Active` or `Inactive`
- Add downgrade/reactivation banners on inactive cards
- Replace generic create CTA with tier-aware copy when caps are reached

### Create Project

- Add project-type selector at the top using three radio cards
- Show which types are available for the current account tier
- Lock unavailable types with explanation
- When `Free` is selected, force public visibility and explain why
- Show current portfolio counts before submit
- Show minute/collaborator/guest rules inline for the selected type

### Project Settings

- Add a non-editable project-type badge
- Add active/inactive status chip
- Add a tier rules panel:
- recording-minute cap
- collaborator cap
- guest cap
- PM job cap
- export/download entitlement
- If the project is `Free`, replace the visibility toggle with locked messaging
- If inactive, show a banner with reactivation path

### Members

- Add counters above the list:
- `Collaborators used: 3 / 4`
- `Guests used: 2 / 3`
- Define in product/backend whether `Guest` role maps to guest quota and every non-guest member maps to collaborator quota
- Disable `Add member` and role changes that would exceed the quota
- Show reason-specific tooltip:
- `Premium projects allow up to 4 collaborators`
- `Free projects allow 1 collaborator` if that rule is confirmed

### Dashboard

- Add a tier banner under the project name:
- project type
- state
- minutes used
- PM jobs used
- export status
- Disable or filter the `Create new analysis` modal by entitlement
- If PM jobs are capped, surface a remaining-job counter on the PM card
- If project is inactive, replace action buttons with reactivation guidance

### Import

- Add a usage banner:
- current recorded minutes
- cap for the project type
- warning threshold
- If inactive, block imports with a clear reason

### Account Settings

- Add a `Plan` or `Subscription` section to the existing Account Settings page
- Show current account tier: `Free`, `Pro`, or `Enterprise`
- Show current owned-project usage by type
- Add downgrade CTA on this page
- Add downgrade review flow in-place or modal-based, without creating a new page
- Let the user choose which projects keep paid slots during downgrade
- Show which projects will become `View-only`
- Require confirmation before final downgrade submission

### Existing export/download actions

- Keep the current pages, but route every export/download button through a shared entitlement check
- Standardize one tooltip/banner message across recordings, species, sites, insights, CNN exports, and backup

## 10. Recommended Implementation Order

1. Lock steady-state limits to the published-features PDF.
2. Confirm downgrade retention behavior that should coexist with the `FINAL` numbers.
3. Add backend fields and API responses for `accountTier`, `projectType`, `projectState`, and usage counters.
4. Add a shared frontend entitlement helper so every page asks the same questions.
5. Update existing pages in this order: `Account Settings`, `My Projects`, `Create Project`, `Project Settings`, `Members`, `Dashboard`, `Import`, export/download surfaces.
6. Add downgrade-specific inactive-state banners and reactivation flows.

## 11. Draw.io Artifact

See:

- [docs/product/arbimon-tiering-workflow.drawio](/Users/tooseriuz/Github/arbimon/docs/product/arbimon-tiering-workflow.drawio:1)

The diagram shows:

- account-tier entry points
- project-type creation rules
- active vs inactive project state
- key page-level UI checks
- downgrade flows and retained active projects
