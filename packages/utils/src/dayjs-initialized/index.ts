// eslint-disable-next-line regex/invalid -- this is the one place we import & configure da
import dayjsBase from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isoWeek from 'dayjs/plugin/isoWeek'
import minMax from 'dayjs/plugin/minMax'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import utc from 'dayjs/plugin/utc.js'

dayjsBase.extend(isoWeek)
dayjsBase.extend(minMax)
dayjsBase.extend(pluralGetSet)
dayjsBase.extend(utc)
dayjsBase.extend(duration)

export const dayjs = dayjsBase
