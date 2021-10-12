// This is the one place we import & configure dayjs
// eslint-disable-next-line unicorn/import-style
import dayjsBase from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import utc from 'dayjs/plugin/utc'

dayjsBase.extend(utc)
dayjsBase.extend(quarterOfYear)
dayjsBase.extend(pluralGetSet)
dayjsBase.extend(minMax)

export const dayjs = dayjsBase
