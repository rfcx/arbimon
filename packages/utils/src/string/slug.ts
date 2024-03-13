import { kebabCase } from 'lodash-es'

export const PROJECT_SLUG_MAX_LENGTH = 50

// Lodash's kebab function removes spaces, special characters
export const slugify = (input: string): string => kebabCase(input)

export const isValidSlug = (input: string): boolean => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(input)
