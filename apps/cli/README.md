# Biodiversity > CLI

CLI scripts (ex: to export data from Arbimon)

## Getting started

1. Config .env file as describe in `example.env`

## Modes

During local testing, some scripts automatically limit queries to reduce load on 3rd-party APIs -- you will see a banner:

> Running in DEV mode

To run these scripts in production mode, you must set a flag:

```
pnpm serve lib/path/to/some/script.js -- --mode=production
```

## Examples

### Data Ingest

Get detections data from Arbimon and write it to a JSON file

```
pnpm serve lib/data-ingest/detections/to-json.js
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
