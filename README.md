# Biodiversity Analytics

Website for exploring biodiversity data; built with Vue 3, Typescript, Vite, pnpm, Pinia, Windi CSS.

<img src="https://user-images.githubusercontent.com/31901584/183742923-930ebc4c-9c44-4804-ae95-245d47724357.png" width="1680" alt="Biodiversity" />

## Contributing

### _Sprint DoD (The Definition of Done)_

The following must be true to consider a feature **"DONE"**:

- Code follows [CONTRIBUTING.md](./CONTRIBUTING.md)
- Updated [CHANGELOG.md](./CHANGELOG.md)
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

   - node 16: [https://nodejs.org](https://nodejs.org)
   - pnpm 7: `npm i -g pnpm@7`
   - VSCode & extensions: `pnpm node init-vscode` (requires [`code` command in path](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line))
     - If you have Vetur installed, disable it for this workspace
   - Docker Desktop: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. Install/update dependencies:

   `pnpm i`

3. Create local environment:

   - Copy `apps/api/.env.example` to `.env`, and fill missing variables

4. (optional) Override default environment:

   - Create `apps/cli/.env.local` (and override variables as necessary)
   - Create `apps/website/.env.local` (and override variables as necessary)

## Run the App!

1. Start **DB**, **API**, and **Website** in dev-mode:

   `pnpm serve` (from the monorepo root)  
   _or_  
   `pnpm -w serve` (from anywhere in the project)

2. After you finish, you might want to stop your db:

   `pnpm --filter=db stop`

## More Commands

### _Resetting Workspace_

If you encounter an issue, you may want to clean caches and artifacts, or reinstall dependencies.

- Delete all build and lint artifacts/caches:

  `pnpm -r clean`

- Delete all build and lint artifacts/caches AND dependencies (node_modules):

  `pnpm -w clean-slate` (usually followed by `pnpm i` to reinstall a fresh copy)

### _Build_

- Build any package (and it's dependencies):

  `pnpm build`

- Use the pnpm arg `-r` to build all packages:

  `pnpm -r build`

### _Lint_

- Run all linters, or only a single linter:

  `pnpm lint` (all linters)  
  `pnpm lint:eslint`  
  `pnpm lint:prettier`  
  `pnpm lint:stylelint`

- Lint is pretty heavy; use the helper to run it sequentially across all packages:

  `pnpm -w lint-all`

- Run linters with auto-fixes:

  `pnpm lint-fix` (one package)  
  `pnpm -w lint-fix-all` (all packages)

### _Test_

- Start a separate test database (required for integration tests):

  `pnpm -w serve-int`

- Each package has some of the following test scripts:

  `pnpm test:component` (unit tests for vue components)  
  `pnpm test:int` (heavy tests or tests that require a database)  
  `pnpm test:unit` (basic unit tests)  
  `pnpm test-ui` (tests executed in a browser)

- For TDD, you probably want to execute a single file, `describe`, or `test`:

  `pnpm exec vitest src/_services/picker/time-of-day-picker.component.test` (fast way to execute 1 file)  
  `pnpm exec vitest src/_services/picker/time-of-day-picker.component.test -t "has all, dirunal, nocturnal options"` (filter within the file; you should use this _in addition_ to file-path filtering)

- For TDD integration tests, you need a more complex command:

  `pnpm exec cross-env BIO_DB_PORT=5434 vitest --no-threads src/sync/sync-history-handler.int.test`

- You can also run all tests in a package, or across the entire project:

  `pnpm ci-all-test-component` (unit tests for vue components)
  `pnpm ci-all-test-unit` (basic unit tests)  
  `pnpm -w test-all` (calls `test` in all packages sequentially, like `lint-all`)

### _Cheatsheet: pnpm_

- Run in monorepo root:
  `pnpm -w _command_` (can be run from anywhere)

- Run in all packages:
  `pnpm -r _command_`

- Run in some packages:
  `pnpm -r --filter=./apps _command_`

- Run in all packages, except root:
  `pnpm --filter=!rfcx-bio _command_`
  (or `pnpm --filter=\!rfcx-bio _command_` in zsh)

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

Environments `staging` and `production` are automatically deployed by GitHub Actions (CD):

- every push to `staging` branch => `staging` deploy
- every push to `master` branch => `production` deploy

## Environment (Config and Secrets)

### _Local Environment_

- Developers can override configuration and secrets locally using:

  - `/apps/api/.env` (copy `.env.example` to get started)
  - `/apps/cli/.env.local` (override any variable in `.env`)
  - `/apps/website/.env.local` (override any variable in `.env`)

- CLI and website also support "modes", which will load respective env:

  `pnpm serve -- --mode=staging` (from their directories; not from the monorepo root)

### _Deployed Environment_

- _Config_ variables are committed to Git:
  - `/tools/deployment/api/<NAMESPACE>/config.yaml`
  - `/apps/website/.env`
- _Secret_ variables must be manually configured:
  - API secrets can be set manually via `kubectl apply tools/deployment/api/production/secrets.yaml` (make a copy of `tools/deployment/api/secrets.example.yaml`)
  - Website secrets can be set manually as GitHub secrets
  - **Secrets should never be committed to Git**
