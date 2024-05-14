import { type Middleware } from '~/api-helpers/types'

export const logBody: Middleware<void> = async (req): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- fastify runs by generics so this is going to be unknown.
  if (req?.body) {
    req.log.info({ body: req?.body }, 'parsed body')
  }
}
