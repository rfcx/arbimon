import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import QuickLRU from 'quick-lru'

export type GetUserIdCallback = (email: string, userInfo: { idAuth0: string, firstName: string, lastName: string }) => Promise<number>

export interface UserPluginOptions {
  getUserIdCallback: GetUserIdCallback
}

const plugin: FastifyPluginCallback<UserPluginOptions> = (instance, options, done) => {
  const getUserId = options.getUserIdCallback

  const lru = new QuickLRU<string, number>({
    maxSize: 500,
    maxAge: 15 * 60 * 1000 // 15 minutes
  })

  instance.decorateRequest('userId', undefined, ['userToken'])

  instance.addHook('preHandler', async (request) => {
    if (request.userToken === null) {
      return
    }

    const { email, ...userInfo } = request.userToken

    // Try cache
    const cachedUserId = lru.get(email)
    if (cachedUserId !== undefined) {
      request.userId = cachedUserId
      return
    }

    // Get/create user via callback
    const userId = await getUserId(email, userInfo)

    lru.set(email, userId)
    request.userId = userId
  })

  instance.addHook('onClose', () => { lru.clear() })

  done()
}

export const userPlugin = fp(plugin, {
  fastify: '3.x',
  name: 'user'
})

declare module 'fastify' {
  interface FastifyRequest {
    userId: number | undefined
  }
}
