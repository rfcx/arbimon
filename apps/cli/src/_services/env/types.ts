export type Protection = 'off' | 'warn'

export const PROTECTION_VALUES: Record<string, Protection> = {
  OFF: 'off',
  WARN: 'warn'
}

export type BioEnvironment = 'default' | 'testing' | 'staging' | 'production'

export const BIO_ENVIRONMENT_VALUES: Record<string, BioEnvironment> = {
  DEFAULT: 'default',
  TESTING: 'testing',
  STAGING: 'staging',
  PRODUCTION: 'production'
}
