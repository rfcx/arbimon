import 'fastify-request-context'

declare module 'fastify-request-context' {
  interface RequestContextData {
    IS_PROJECT_MEMBER: boolean
    MEMBER_PROJECT_CORE_IDS: string[]
  }
}
