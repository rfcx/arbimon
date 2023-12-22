import fastify, { type FastifyInstance } from 'fastify'
import { expect, test, vi } from 'vitest'

import { type GetUserIdCallback, userPlugin } from './user'

const getApp = async (email: string, getUserIdCallback: GetUserIdCallback): Promise<FastifyInstance> => {
  const app = await fastify()
  app.decorateRequest('userToken', { email })
  await app.register(userPlugin, { getUserIdCallback })
  return app
}

const method = 'GET'
const url = '/hello'

test('can get expected userId from request', async () => {
  // Arrange
  const expectedEmail = 'hello@you.com'
  const expectedUserId = 47
  const getUserId: GetUserIdCallback = async (email) => await Promise.resolve(email === expectedEmail ? expectedUserId : 56)
  const app = await getApp(expectedEmail, getUserId)
  app.route({ method, url, handler: async (req) => await Promise.resolve({ userId: req.userId }) })

  // Act
  const response = await app.inject({ method, url })

  // Assert
  const result = JSON.parse(response.body)
  expect(result.userId).toBe(expectedUserId)
})

test('callback is only called once', async () => {
  // Arrange
  const getUserId: GetUserIdCallback = vi.fn(async () => await Promise.resolve(34))
  const app = await getApp('hello@you.com', getUserId)
  app.route({ method, url, handler: async (req) => await Promise.resolve({ userId: req.userId }) })

  // Act
  await app.inject({ method, url })
  await app.inject({ method, url })

  // Assert
  expect(getUserId).toBeCalledTimes(1)
})
