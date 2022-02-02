import { urlify } from '@rfcx-bio/utils/url-helpers'

import { env } from './_services/env'

console.info(urlify('This is an example script'))
console.info(`Protection for current env is ${env.PROTECTION}`)
