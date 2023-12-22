import type QuickLRU from 'quick-lru'

import { type ExtractedUser } from '../../_plugins/global-user-cache'

import 'fastify-request-context'

declare module 'fastify-request-context' {
  interface RequestContextData {
    IS_PROJECT_MEMBER: boolean
    MEMBER_PROJECT_CORE_IDS: string[]
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    lru: QuickLRU<string, ExtractedUser>
    extractedUser: ExtractedUser | null
  }

  interface FastifyInstance {
    lru: QuickLRU<string, ExtractedUser>
  }
}
