# Biodiversity > CLI

CLI scripts (ex: to export data from Arbimon)

## Getting started

1. Config .env file as describe in `example.env`

2. To export data from Arbimon:

   `pnpm serve src/abimon-export/export.ts`

3. To tranform the Arbimon raw data to different formats:

   3.1 extract sites

   `pnpm serve src/abimon-export/extract-sites.ts`

   3.2 extract species

   `pnpm serve src/abimon-export/extract-species.ts`

4. To export species information with IUCN / Wiki

`pnpm serve src/species/index.ts`

5. To get completed species data (species information + species call)

   5.1 Put `raw-species-from-arbimon.ts` from step 3.2 and `raw-species-with-info.ts` from step 4 under the `src/species` category
   5.2 Run the following command to combine the data

`pnpm serve src/species/combine-species-call-and-info.ts`

## Database Migrations

Run migrations manually (note: the target database must be running)

```
pnpm serve src/db-migrations -- --verbose
```
