import { getProject } from '../api-core/api-core'
import { Forbidden } from '../errors/data-access-errors'

export async function hasAccessToProject (id: string, token: string): Promise<boolean> {
  if (!token) return false

  return await getProject(id, token)
    .then(() => true)
    .catch(err => {
      // Forbidden is expected (it means the user is not a project member)
      if (!(err instanceof Forbidden)) console.error(err)
      return false
    })
}
