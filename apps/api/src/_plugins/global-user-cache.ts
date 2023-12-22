import { type FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import QuickLRU, { type Options } from 'quick-lru'

import { type UserProfile } from '@rfcx-bio/common/dao/types'

const plugin: FastifyPluginCallback<Options<string, UserProfile>> = (instance, options, done) => {
  const lru = new QuickLRU(options)

  instance.decorate('lru', lru)
  instance.decorateRequest('lru', null)
  instance.addHook('preValidation', (req, _rep, done) => {
    req.lru = lru
    done()
  })
  instance.addHook('onClose', () => { lru.clear() })

  done()
}

export const fastifyLruCache = fp(plugin, {
  fastify: '3.x',
  name: 'fastify-lru-cache'
})
