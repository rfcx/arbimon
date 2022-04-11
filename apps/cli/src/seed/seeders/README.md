# Seeders

**[ WARNING ] Seeders must have unique filenames (even if they are in different directories)**

Seeders are only executed on the latest schema
- If you update the DB schema via a migration, you need to update related seeders
- There is no reason to keep historical versions of seeders

## Local

Seeders in several folders will be automatically run as part of global `serve` (see `local-seeders.ts`)

The same seeders can be executed manually using:

- `pnpm db-rms` (reset-migrate-seed)  
- `pnpm db-seed`

You can also run specific seeders manually:

- `pnpm serve lib/seed -- --path=01-integration-test-data,03-preload`  
- `pnpm serve lib/seed -- --path=03-preload/001-preload-taxon-species-rfcx.js`

## Testing/Staging

You can run any seeder manuually on `testing`/`staging` using `--mode`:

- `pnpm serve lib/seed -- --mode=testing --path=directory/name-of-seeder.js`

## Production

**Do not commit production data/seeders.**

You can run seeders in `production` using the same process as `testing`/`staging`
