import { getProject } from '../api-core/api-core'
import { Unauthorized } from '../errors/data-access-errors'

export async function hasAccessToProject (id: string, token: string): Promise<boolean> {
  return await getProject(id, token)
    .then(() => true)
    .catch(err => {
      if (err instanceof Unauthorized) console.error(err)
      return false
    })
}
