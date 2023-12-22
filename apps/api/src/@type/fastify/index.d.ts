import 'fastify-request-context'

declare module 'fastify-request-context' {
  interface RequestContextData {
    MEMBER_PROJECT_CORE_IDS: string[]
  }
}
