# Biodiversity > CLI

CLI scripts to be run locally or as CRON jobs

## Modes

During local testing, some scripts automatically limit queries to reduce load on 3rd-party APIs -- you will see a banner:

> Running in DEV mode

To run these scripts in "production" mode, you must set a flag:

```
pnpm serve lib/path/to/some/script.js -- --mode=production
```

## Examples

### Data Ingest (Sync)

Get all data (incremental) from Arbimon and write it to a bio

```
pnpm serve lib/ingest/sync/incremental.js
```

### Database Migrations

Run migrations manually (note: the target database must be running)

```
pnpm migrate -- --verbose
```

Completely reset the database (deletes all tables & wipes migration log):

```
pnpm serve lib/db/reset
```

### Test

- Integration tests
```
pnpm test-int
```

- Unit tests
```
pnpm test-unit
```
