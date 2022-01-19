import { ProjectService } from './project-service'

export const projectService = new ProjectService(import.meta.env.VITE_BIO_API_BASE_URL)
