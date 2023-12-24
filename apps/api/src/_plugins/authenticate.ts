import { type FastifyPluginCallback } from 'fastify'
import fastifyAuth0Verify, { type FastifyAuth0VerifyOptions } from 'fastify-auth0-verify'
import fp from 'fastify-plugin'

import { authenticate } from '~/auth0/authenticate'
import { type Auth0UserToken } from '~/auth0/types'

const plugin: FastifyPluginCallback<FastifyAuth0VerifyOptions> = (instance, options, done) => {
  fastifyAuth0Verify(instance, options, (e) => {
    if (e) {
      done(e); return
    }

    instance.decorateRequest('userToken', null)

    instance.addHook('preHandler', async (request, reply) => {
      const authorization = request.headers.authorization
      if (authorization === undefined || !authorization.startsWith('Bearer ')) {
        return
      }

      request.userToken = await authenticate(request)
    })
    done()
  })
}

export const authenticatePlugin = fp(plugin, {
  fastify: '3.x',
  name: 'authenticate'
})

declare module 'fastify' {
  interface FastifyRequest {
    userToken: Auth0UserToken | null
  }
}
