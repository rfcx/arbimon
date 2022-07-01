# Biodiversity > CLI

CLI scripts to be run locally or as CRON jobs

## Quick Start

Run a script using `serve` and the script's path under `lib`:

- `pnpm serve lib/index.js`

If you need to pass arguments to a script, don't forget to use `--` to tell `pnpm` to pass-thru:

- `pnpm serve lib/path/to/some-script.js -- --some-param=123`

**TL;DR: Don't forget:**

- `lib` (not `src`)
- `.js` (not `.ts`)
- `--` before script arguments

## Environment

The default environment is declared in `.env`, committed to Git, and shared with the team. Scripts will run using:

- **LOCAL** - Bio DB
- **NO** - Arbimon DB
- **NO** - Core DB/APIs

You can override the default environment locally by editing `.env.local`  
**All secrets must be declared in `.env.local`, not in `.env`**

To avoid repeatedly editing/changing environment files (which creates uncertainty and risk, ex: forgetting you're connected to production), you are encouraged to define standard modes.

## Modes

You can specify a "mode" to import additional predefined env:

- `pnpm serve lib/path/to/some/script.js -- --mode=testing`

The following env files will be imported based on the mode (with later files overriding earlier files):

- `.env`
- `.env.local`
- `.env.${mode}` (ex: `.env.testing`)
- `.env.${mode}.local` (ex: `.env.testing.local`)

With no explicit mode set, scripts will start with a banner:

> **_ Biodiversity CLI _**  
> Running in default mode

When using a mode that has the config option `PROTECTION=warn`, you will see the following banner:

> **_ Biodiversity CLI _**  
> Running in TESTING mode  
> This is a protected mode - are you sure you want to continue? (y|N)

### Common Modes

**Note: You will need to add secrets in respective `.env.${mode}.local` files**

_Parallel deployments:_

- `production` - PRODUCTION Bio/Arbimon/Core
- `staging` - STAGING Bio/Arbimon/Core
- `testing` - TESTING Bio/Arbimon/Core (or STAGING if no TESTING)

_Bio local + remote external:_

- `locpro` - LOCAL Bio; PRODUCTION Arbimon/Core
- `locsta` - LOCAL Bio; STAGING Arbimon/Core

### Custom Modes

**You can create whatever modes you want!**

If you wanted a new **shared** mode `abc`, you would create:

- `.env.abc` (config; secret keys; committed)
- `.env.abc.local` (secret values; NOT committed)

If you wanted a new **private** mode, `def`, you would create:

- `.env.def.local` (config & secrets; NOT committed)

You could use these modes like:

- `pnpm serve lib/path/to/some/script.js -- --mode=abc`
- `pnpm serve lib/path/to/some/script.js -- --mode=def`

## Examples

### Data Ingest (Sync)

Get all data (incremental) from Arbimon and write it to a bio

```
pnpm serve lib/ingest/sync/incremental.js
```

### Database Migrations

If you're targeting a local database, you must first start it:

- `pnpm --filter=db serve` (local dev DB)
- `pnpm --filter=db serve-int` (local integration test DB)

Completely reset the database (deletes all tables & wipes migration log):

- `pnpm db-reset`

Run migrations (creates tables, views, etc)

- `pnpm db-migrate -- --verbose`

Run seeders (inserts fake data)

- `pnpm db-seed -- --verbose`

Run reset, migrate, and seed (as 1 script):

- `pnpm db-rms`
- `pnpm db-rms-int`
