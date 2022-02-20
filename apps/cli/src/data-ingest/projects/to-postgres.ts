import { getArbimonProjects } from './input-arbimon'
import { writeProjectsToPostgres } from './output-postgres'

const main = async (): Promise<void> => {
  const projects = await getArbimonProjects()
  await writeProjectsToPostgres(projects)
  process.exit(0)
}

await main()
