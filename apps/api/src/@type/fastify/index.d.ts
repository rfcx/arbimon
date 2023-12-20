import type QuickLRU from 'quick-lru'

import { type UserProfile } from '@rfcx-bio/common/dao/types'

import { type Auth0UserInfo } from '~/auth0/types'

import 'fastify-request-context'

declare module 'fastify-request-context' {
  interface RequestContextData {
    IS_PROJECT_MEMBER: boolean
    MEMBER_PROJECT_CORE_IDS: string[]
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    lru: QuickLRU<string, UserProfile>
    extractedUser: Pick<Auth0UserInfo, 'auth0_user_id' | 'email'> | null
  }

  interface FastifyInstance {
    lru: QuickLRU<string, UserProfile>
  }
}
