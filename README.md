# Biodiversity Analytics

Website for exploring **biodiversity data**

Built with:

- Vue 3
- Typescript
- Vite
- pnpm
- Pinia
- Windi CSS

_Image 1: The screenshot of the Biodiversity website_

<img src="https://user-images.githubusercontent.com/31901584/183742923-930ebc4c-9c44-4804-ae95-245d47724357.png" width="1680" alt="Biodiversity" />

## Contributing

### _Sprint DoD (The Definition of Done)_

The following must be true to consider a feature is **"DONE"**:

- Code follows [CONTRIBUTING.md](./CONTRIBUTING.md)
- Changelog at [CHANGELOG.md](./CHANGELOG.md)
- Code deployed to [staging](https://staging-bio.rfcx.org/)
- Demo video sent to [#biodiversity-vision](https://rfcx.slack.com/archives/C02DJUZLNCE)

### _Resources_

- [Roadmap](https://docs.google.com/presentation/d/1id5AlF8pMdBgPravcf0q6lPOC09aHDFKGokJSUmkBmM/edit#slide=id.g131f6138dba_0_0)
- [Design (Figma)](https://www.figma.com/files/team/1022436685454438648/Biodiversity-Team)
- [Product & Sprint Backlogs (GitHub)](https://github.com/orgs/rfcx/projects/9)
- [Other files (Google Drive)](https://drive.google.com/drive/u/2/folders/0AEi1v_8CH7p8Uk9PVA)

## Installation

### _One-Time Setup_

1. Install tools:

   - **node 16**: [https://nodejs.org](https://nodejs.org)
   - **pnpm 6**: `npm i -g pnpm@6`
   - **VSCode & extensions**: `pnpm node init-vscode` (requires [`code` command in path](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line))
     - If you have Vetur installed, disable it for this workspace
   - **Docker Desktop**: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. Install/Update dependencies:

   - `pnpm i`

3. Create local environment:

   - Copy `apps/api/.env.example` to `.env`, and fill missing variables

4. Override default environment (_optional_):
   - Create `apps/cli/.env.local`, and override variables as necessary
   - Create `apps/website/.env.local`, and override variables as necessary

## Run the App!

1. Start three applications: **DB**, **API**, and **Website** in dev-mode:

   - `pnpm serve` (_from the monorepo root_)  
     _or_
   - `pnpm -w serve` (_from anywhere in the project_)

2. Stop your db once you are finish:

   - `pnpm --filter=db stop`

## More Commands

### _Resetting Workspace_

If you encounter an issue, you may want to clean caches and artifacts, or reinstall dependencies.

- Delete all build and lint artifacts/caches:

  - `pnpm -r clean`

- Delete all build and lint artifacts/caches AND dependencies (node_modules):

  - `pnpm -w clean-slate` (usually followed by `pnpm i` to reinstall a fresh copy)

### _Build_

- Build any package (and it's dependencies):

  - `pnpm build`

- Use the pnpm arg `-r` to build all packages:

  - `pnpm -r build`

### _Lint_

- Run all linters, or only a single linter:

  - `pnpm lint` (_all linters_)
  - `pnpm lint:eslint`
  - `pnpm lint:prettier`
  - `pnpm lint:stylelint`

- Lint is pretty heavy; use the helper to run it sequentially across all packages:

  - `pnpm -w lint-all`

- Run linters with auto-fixes:

  - `pnpm lint-fix` (_one package_)
  - `pnpm -w lint-fix-all` (_all packages_)

### _Test_

- Start a local Postgres database before running `test:int`:

  - `pnpm -w serve-int`

- Use the following test scripts, which are located in each package:

  - `pnpm test:component` (_unit tests for vue components_)
  - `pnpm test:int` (_heavy tests or tests that require a database_)
  - `pnpm test:unit` (_basic unit tests_)
  - `pnpm test-ui` (_tests executed in a browser_)

- Execute a single test file, `describe`, or `test`; to follow TDD (Test-driven development):

  - `pnpm exec vitest src/_services/picker/time-of-day-picker.component.test` (_fast way to execute 1 file_)
  - `pnpm exec vitest src/_services/picker/time-of-day-picker.component.test -t "has all, dirunal, nocturnal options"` (_filter within the file; you should use this **in addition** to file-path filtering_)

- Run more complex command for TDD integration tests:

  - `pnpm exec cross-env BIO_DB_PORT=5434 vitest --no-threads src/sync/sync-history-handler.int.test`

- Run all tests in a package, or across the entire project:

  - `pnpm test` (_all vitest-based tests; does not include Cypress-based tests_)
  - `pnpm -w test-all` (_calls `test` in all packages sequentially, like `lint-all`_)

### _Cheatsheet: pnpm_

- Run in monorepo-root:
  - `pnpm -w _COMMAND_NAME_`
- Run in all packages:
  - `pnpm -r _COMMAND_NAME_`
- Run in some packages:
  - `pnpm -r --filter=./apps _COMMAND_NAME_`
- Run in one package:
  - `pnpm --filter=website _COMMAND_NAME_`
- Run in all packages, except root:

  - `pnpm --filter=!rfcx-bio _COMMAND_NAME_`

    _or_

  - `pnpm --filter=\!rfcx-bio blah` (_in zsh_)

Replace _COMMAND_NAME_ with a required command

## Deployment

There are 3 shared deployments:

- **testing**: for the DT to test features when deployed & collaborate
  - https://testing-bio.rfcx.org
  - https://testing-bio.rfcx.org/api
- **staging**: for stakeholders to review & give early feedback
  - https://staging-bio.rfcx.org
  - https://staging-bio.rfcx.org/api
- **production**: real public project
  - https://bio.rfcx.org
  - https://bio.rfcx.org/api

### _Deployment: Testing_

Any branch can be deployed to the `testing` cluster:

1. Open the "Actions" tab on GitHub
2. Select the "Build-Deploy" action
3. Click on "Run workflow", and select the branch you wish to deploy

_Note: `develop` branch is auto-deployed to `testing` daily_

### _Deployment: Staging and Deployment: Production_

`staging` and `production` are automatically deployed by GitHub Actions (CD):

- **staging deploy**: every push to `staging` branch
- **production deploy**: every push to `master` branch

## Environment (Config and Secrets)

### _Local Environment_

Developers can override configuration and secrets locally using:

- `/apps/api/.env` (_copy `.env.example` to get started_)
- `/apps/cli/.env.local` (_override any variable in `.env`_)
- `/apps/website/.env.local` (_override any variable in `.env`_)

CLI and website also support "modes", which will load respective enviroments:

- `pnpm serve -- --mode=staging` (_from their directories; not from the monorepo root_)

### _Deployed Environment_

- **Config** variables are committed to Git:
  - `/tools/deployment/api/<NAMESPACE>/config.yaml`
  - `/apps/website/.env`
- **Secret** variables must be manually configured:
  - API secrets can be set manually via Kubernetes apply
  - // TODO: run Kubernetes apply from CD
  - Website secrets can be set manually as GitHub secrets
  - **_Secrets should never be committed to Git_**
