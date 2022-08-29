# Seeders

Seeders are only executed on the latest schema.

If you update the schema via a migration, and you want to continue using a related seeder, you need to update the seeder.

There is no reason to keep historical versions of seeders.

## Local development

Seeders in several folders will be automatically run as part of global `serve` (see `default-seeders.ts`)

The same seeders can be executed manually using:

- `pnpm db-rms` (reset-migrate-seed)  
- `pnpm db-seed`

You can also run specific seeders manually:

- `pnpm serve lib/db/seed -- --path=01-integration-test-data,03-preload-external-data`  
- `pnpm serve lib/db/seed -- --path=03-preload/001-preload-taxon-species-rfcx.js`

## Testing/Staging

You can run any seeder manually on `testing`/`staging` using `--mode`:

- `pnpm serve lib/db/seed -- --mode=testing --path=directory/name-of-seeder.js`

## Production

**Do not commit production data/seeders.**

You can run seeders in `production` using the same process as `testing`/`staging`

## Writing new seeds

### For integration tests

Use the folder `01-integration-test-data`.

// TODO Scenarios

### Others

There are predefined folders for:
- `02-arbimon-mock-data`: mock data imported from Arbimon
- `03-preload-external-data`: loaded from IUCN and Wikipedia to avoid heavy initial imports
- `04-user-data-mock`: // TODO Describe
