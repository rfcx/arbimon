import { type Middleware } from '~/api-helpers/types'
import { BioUnauthorizedError } from '~/errors'

export const requireAuthorized: Middleware<void> = async (req): Promise<void> => {
  if (req.userId === undefined) {
    throw BioUnauthorizedError()
  }
}
