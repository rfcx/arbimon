// eslint-disable-next-line regex/invalid -- this is the one place we import & configure da
import dayjsBase from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import duration from 'dayjs/plugin/duration'
import isoWeek from 'dayjs/plugin/isoWeek'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import minMax from 'dayjs/plugin/minMax'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjsBase.extend(advancedFormat)
dayjsBase.extend(duration)
dayjsBase.extend(isoWeek)
dayjsBase.extend(localizedFormat)
dayjsBase.extend(minMax)
dayjsBase.extend(pluralGetSet)
dayjsBase.extend(utc) // UTC must come before timezone
dayjsBase.extend(timezone)

export const dayjs = dayjsBase
