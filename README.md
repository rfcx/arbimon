# Biodiversity Analytics

Biodiversity analytics platform built with Vue 3, Typescript, Vite, pnpm, Pinia, Windi CSS

-----

## Contributing

### *Sprint DoD*

The following must be true to consider the Sprint "DONE":

- Code follows [STANDARDS.md](https://github.com/rfcx/biodiversity-analytics/blob/develop/STANDARDS.md)
- Updated [CHANGELOG.md](https://github.com/rfcx/biodiversity-analytics/blob/develop/CHANGELOG.md)
- PRs merged & deployed to staging
- Demo video & staging URL sent to PO by Tuesday

### *Resources*

- [Product & Sprint Backlogs (GitHub)](https://github.com/orgs/rfcx/projects/4)
- [Design (Figma)](https://www.figma.com/files/team/1022436685454438648/Biodiversity-Team)
- [Other files (Google Drive)](https://drive.google.com/drive/folders/17ZdAoPzetLPqkes4lkGQlKg_uHpkyxxg)

-----

## Installation

### *Requirements & Setup*

- node 16+
- pnpm 6+ (`npm i -g pnpm`)
- VSCode & extensions (`pnpm init-vscode`)

_If you have Vetur installed, disable it for this workspace_

### *Getting Started*

1. Install/update dependencies:

   `pnpm i`

2. Run the web app (from the monorepo root):

   `pnpm serve-website` -or- `pnpm serve`

3. If you aren't in the monorepo root, you can still call its scripts by adding the `-w` arg:

   `pnpm -w serve`

-----

## More Commands

### *Build, Lint, Test*

- Use the pnpm arg `-r` to run scripts in all packages:

  `pnpm -r build`  
   `pnpm -r lint`  
   `pnpm -r test`

- You can run all lint auto-fixes with:

  `pnpm -r lint-fix`

### *Resetting Workspace*

- Delete all build artifacts:

  `pnpm -r clean`

- Delete all dependencies:

  `pnpm -w clean-slate`

### *Cheatsheet: pnpm*

- `pnpm -w blah` => run in monorepo-root
- `pnpm -r blah` => run in all packages
- `pnpm -r --filter {"packages"} blah` => run in all packages, except root
- `pnpm --filter=website blah` => run in "website" (or api, cli, ...)
