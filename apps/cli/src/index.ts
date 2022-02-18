import { urlify } from '@rfcx-bio/utils/url-helpers'

import { requireEnv } from '~/env'

const { PROTECTION } = requireEnv('PROTECTION')

console.info(urlify('This is an example script'))
console.info(`Protection for current env is ${PROTECTION}`)
