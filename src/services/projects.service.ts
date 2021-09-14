import { ProjectModels } from '@/models'

// ! Update api after got an confirmation
export async function getProjects (): Promise<ProjectModels.Project[]> {
  const projects: ProjectModels.Project[] = []

  for (let idx = 1; idx <= 10; idx++) {
    projects.push({
      id: `project-id-${idx}`,
      name: `project-${idx}`
    })
  }

  return projects
}
