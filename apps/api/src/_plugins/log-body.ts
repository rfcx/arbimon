import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

const plugin: FastifyPluginCallback = (instance, _options, done) => {
  instance.addHook('preHandler', (req, _rep, next) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- request body can have value, the type is just wrong because fastify relies heavily on generics.
    if (req?.body) {
      req.log.info({ body: req.body }, 'parsed body')
    }

    next()
  })

  done()
}

export const logBodyPlugin = fp(plugin, {
  fastify: '3.x',
  name: 'log-body'
})
