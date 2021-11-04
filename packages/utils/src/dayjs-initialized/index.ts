// This is the one place we import & configure dayjs
import * as dayjsBase from 'dayjs' 
import * as minMax from 'dayjs/plugin/minMax'
import * as pluralGetSet from 'dayjs/plugin/pluralGetSet'
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear'
import * as utc from 'dayjs/plugin/utc'

dayjsBase.extend(utc)
dayjsBase.extend(quarterOfYear)
dayjsBase.extend(pluralGetSet)
dayjsBase.extend(minMax)

export const dayjs = dayjsBase
