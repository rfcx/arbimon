import { getArbimonProjects } from '@//data-ingest/projects/arbimon'
import { writeProjectsToPostgres } from '@/data-ingest/projects/db'

const main = async (): Promise<void> => {
  const projects = await getArbimonProjects()
  await writeProjectsToPostgres(projects)
  console.info(`Finished importing ${projects.length} projects`)
  process.exit(0)
}

await main()
