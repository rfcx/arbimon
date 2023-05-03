import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { toCsv } from '@rfcx-bio/utils/file'

import { getSequelize } from '../db/connections'
import { getProjects } from './export-csv/get-projects'

const main = async (): Promise<void> => {
  console.info('CSV Export start')

  try {
    // todo: this is temporary
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const __dirname = dirname(fileURLToPath(import.meta.url))

    const sequelize = getSequelize()

    console.info('STEP: Query data from location_project table')
    const projects = await getProjects(sequelize)

    const csv = await toCsv(projects)
    await writeFile(resolve(__dirname, '..', '..', 'out', `projects_${dayjs().format('YYYY-MM-DD')}.csv`), csv)

    console.info('CSV Export end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('CSV Export end: failed')
  }
}

await main()
