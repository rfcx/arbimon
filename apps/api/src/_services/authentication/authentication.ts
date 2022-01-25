import { FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from 'fastify-jwt'
import fastifyPlugin from 'fastify-plugin'

import { ApiUnautorized } from '../errors'

export const jwtAuthentication = fastifyPlugin(async (fastify, _) => {
  await fastify.register(fastifyJwt)

  fastify.decorate('authenticate', async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await req.jwtVerify()
    } catch (error) {
      throw ApiUnautorized()
    }
  })
})
