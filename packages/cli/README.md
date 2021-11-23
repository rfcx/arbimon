# Biodiversity > CLI

CLI scripts (ex: to export data from Arbimon)

## Getting started

1. Config .env file as describe in `example.env`

2. To export data from Arbimon:

   `pnpm serve src/abimon-export/export.ts`

3. To tranform the data to different formats:

   `pnpm serve src/abimon-export/translate.ts`

4. To export species data with IUCN / Wiki

`pnpm serve src/species/index.ts`
