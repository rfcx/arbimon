import { BioForbiddenError } from '~/errors'
import { getProjectPermission } from '../api-core/api-core'

export const isValidToken = (token: string): boolean => /^Bearer ./i.test(token) // at least 1 character after space

export async function isProjectMember (id: string, token: string): Promise<boolean> {
  if (!isValidToken(token)) return false

  return await getProjectPermission(id, token)
    .then(() => true)
    .catch(err => {
      // Forbidden is expected (it means the user is not a project member)
      if (err instanceof BioForbiddenError) return false

      // Log unexpected errors
      console.error(err)
      return false
    })
}
