# Biodiversity Analytics

Website for exploring biodiversity data; built with Vue 3, Typescript, Vite, pnpm, Pinia, Windi CSS.

## Contributing

### _Sprint DoD_

The following must be true to consider the Sprint "DONE":

- Code follows [STANDARDS.md](./STANDARDS.md)
- Updated [CHANGELOG.md](./CHANGELOG.md)
- Code deployed to staging
- Demo video & staging URL sent to PO by Tuesday

### _Resources_

- [Roadmap (Figma)](https://www.figma.com/file/Z4ybxswWvqiTdEsOgI2w7P/Milestone-and-Epic)
- [Design (Figma)](https://www.figma.com/files/team/1022436685454438648/Biodiversity-Team)
- [Product & Sprint Backlogs (GitHub)](https://github.com/orgs/rfcx/projects/4)
- [Other files (Google Drive)](https://drive.google.com/drive/folders/17ZdAoPzetLPqkes4lkGQlKg_uHpkyxxg)

## Installation

### _One-Time Setup_

1. Install tools:

   - node 16: [https://nodejs.org](https://nodejs.org)
   - pnpm 6: `npm i -g pnpm@6`
   - VSCode & extensions: `pnpm node init-vscode` (requires [`code` command in path](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line))
     - If you have Vetur installed, disable it for this workspace
   - Docker Desktop: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

2. Install/update dependencies:

   `pnpm i`

3. Setup local environment:
   - Copy `apps/api/.env.example` to `.env` (and fill missing variables)
   - Copy `apps/cli/.env.example` to `.env` (and fill missing variables)
   - Copy `apps/website/.env` to `.env.local` (and fill missing variables)

## Run the App!

1. Start **DB**, **API**, and **Website** in dev-mode:

   `pnpm serve` (from the monorepo root)  
   _or_  
   `pnpm -w serve` (from anywhere in the project)

   - If the issue is occured try `pnpm clean-slate`, after `pnpm i` and finally `pnpm serve`

2. After you finish, you might want to stop your db:

   `pnpm --filter=db stop`

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

- Delete all build artifacts AND dependencies (node_modules):

  `pnpm -w clean-slate` (usually followed by `pnpm i` to reinstall a fresh copy)

### _Cheatsheet: pnpm_

- `pnpm -w blah` => run in monorepo-root
- `pnpm -r blah` => run in all packages
- `pnpm -r --filter=./apps blah` => run in some packages
- `pnpm --filter=website blah` => run in one package
- `pnpm --filter=!rfcx-bio blah` => run in all packages, except root  
  (or `pnpm --filter=\!rfcx-bio blah` in zsh)

## Deployment

There are 3 shared deployments:

- testing: for the DT to test features when deployed & collaborate
  - https://testing-bio.rfcx.org
  - https://testing-bio.rfcx.org/api
- staging: for stakeholders to review & give early feedback
  - https://staging-bio.rfcx.org
  - https://staging-bio.rfcx.org/api
- production: real public project
  - https://bio.rfcx.org
  - https://bio.rfcx.org/api

### _Testing_

Any branch can be deployed to the `testing` cluster:

- Open the "Actions" tab on GitHub
- Select the "Build-Deploy" action
- Click "Run workflow" and select the branch you wish to deploy

Note: `develop` branch is auto-deployed to `testing` daily.

### _Staging & Production_

`staging` & `production` are automatically deployed by GitHub Actions (CD):

- every push to `staging` branch => `staging` deploy
- every push to `master` branch => `production` deploy

## Environment (Config & Secrets)

### _Local Environment_

// TODO: Standardize this; I like that `website` is ready to go on fresh clones...

- Developers can set the values of configuration and secrets locally using:
  - `/apps/api/.env` (copy `.env.example` to get started)
  - `/apps/website/.env.local` (override any variable in `.env`)

### _Deployed Environment_

- _Config_ variables are committed to Git:
  - `/tools/deployment/api/<NAMESPACE>/config.yaml`
  - `/apps/website/.env`
- _Secret_ variables must be manually configured:
  - API secrets can be set manually via Kubernetes apply
  - Website secrets can be set manually as GitHub secrets
  - // TODO: run Kubernetes apply from CD
  - **The values of secrets should never be committed to Git**
