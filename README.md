# Biodiversity Analytics

Biodiversity analytics platform built with Vue 3, Typescript, Vite, pnpm, Pinia, Windi CSS

---

## Contributing

### _Sprint DoD_

The following must be true to consider the Sprint "DONE":

- Code follows [STANDARDS.md](https://github.com/rfcx/biodiversity-analytics/blob/develop/STANDARDS.md)
- Updated [CHANGELOG.md](https://github.com/rfcx/biodiversity-analytics/blob/develop/CHANGELOG.md)
- PRs merged & deployed to staging
- Demo video & staging URL sent to PO by Tuesday

### _Resources_

- [Product & Sprint Backlogs (GitHub)](https://github.com/orgs/rfcx/projects/4)
- [Design (Figma)](https://www.figma.com/files/team/1022436685454438648/Biodiversity-Team)
- [Other files (Google Drive)](https://drive.google.com/drive/folders/17ZdAoPzetLPqkes4lkGQlKg_uHpkyxxg)

---

## Installation

### _Requirements & Setup_

- node 16+
- pnpm 6+ (`npm i -g pnpm`)
- VSCode & extensions (`pnpm init-vscode`)

_If you have Vetur installed, disable it for this workspace_

### _Getting Started_

1. Install/update dependencies:

   `pnpm i`

2. Run the web app (from the monorepo root):

   `pnpm serve-website` -or- `pnpm serve`

3. If you aren't in the monorepo root, you can still call its scripts by adding the `-w` arg:

   `pnpm -w serve`

4. For developing `website`, please copy `.env.example` to `.env` at the same directory level and fill in all variables.

---

## Deployment

There are 3 shared deployments:

- testing: for the DT to test features when deployed & collaborate
  - https://testing-ba.rfcx.org
  - https://testing-ba-api.rfcx.org
- staging: for stakeholders to review & give early feedback
  - https://staging-ba.rfcx.org
  - https://staging-ba-api.rfcx.org
- production: real public project
  - https://ba.rfcx.org
  - https://ba-api.rfcx.org

### _Testing_

Any branch can be deployed to the `testing` cluster:

- Open the "Actions" tab on GitHub
- Select the "Build-Deploy" action
- Click "Run workflow" and select the branch you wish to deploy
- // TODO: Auto-deploy from `develop` branch once per day?

### _Staging & Production_

`staging` & `production` are automatically deployed by GitHub Actions (CD):

- every push to `staging` branch => `staging` deploy
- every push to `master` branch => `production` deploy

---

## More Commands

### _Build, Lint, Test_

- Use the pnpm arg `-r` to run scripts in all packages:

  `pnpm -r build`
  `pnpm -r lint`
  `pnpm -r test`

- You can run all lint auto-fixes with:

  `pnpm -r lint-fix`

### _Resetting Workspace_

- Delete all build artifacts:

  `pnpm -r clean`

- Delete all dependencies:

  `pnpm -w clean-slate`

### _Cheatsheet: pnpm_

- `pnpm -w blah` => run in monorepo-root
- `pnpm -r blah` => run in all packages
- `pnpm --filter {"packages"} blah` => run in all packages, except root
- `pnpm --filter=website blah` => run in "website" (or api, cli, ...)
