import { type Dayjs } from 'dayjs'

import { type Filetype } from './create-command'

export const getFilename = (startTime: Dayjs, filetype: Filetype): string => {
  return `exports/${startTime.format('YYYY-MM-DD HH:mm:ss')}/${filetype}.csv`
}
