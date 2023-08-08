import { kebabCase } from 'lodash-es'

export const slugify = (input: string): string => kebabCase(input)
