import dayjsBase from 'dayjs'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import utc from 'dayjs/plugin/utc'

dayjsBase.extend(utc)
dayjsBase.extend(quarterOfYear)
dayjsBase.extend(pluralGetSet)

export const dayjs = dayjsBase
