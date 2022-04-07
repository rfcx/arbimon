import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type ProjectSpeciesFileParams = ProjectSpecificRouteParams & {
  speciesSlug: string
  filenameWithoutExtension: string
}

export const projectSpeciesFileRoute = '/projects/:projectId/species-file/:speciesSlug/:filenameWithoutExtension'

export const projectSpeciesFileUrl = (params: ProjectSpeciesFileParams): string =>
  `/projects/${params.projectId}/species-file/${params.speciesSlug}/${params.filenameWithoutExtension}`

// Response - FastifyReply
