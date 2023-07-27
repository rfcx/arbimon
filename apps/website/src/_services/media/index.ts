import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// INFO: https://github.com/rfcx/rfcx-api/blob/bd2004b7df0cf8d3b4c415affa094180b7b931da/core/stream-segments/bl/segment-file-parsing.js#L4-L7
const possibleWindowFuncs = ['dolph', 'hann', 'hamming', 'bartlett', 'rectangular', 'kaiser'] as const
const possibleExtensions = ['png', 'jpeg', 'wav', 'opus', 'flac', 'mp3'] as const
const possibleFileTypes = ['spec', 'wav', 'opus', 'flac', 'mp3'] as const

export interface GetMediaLinkOptions {
  streamId: string
  start: string
  end: string
  filetype: typeof possibleFileTypes[number]
  fileExtension: typeof possibleExtensions[number]
  frequency?: 'full' | {
    min: number
    max: number
  }
  gain?: number
  dimension?: {
    width: number
    height: number
  }
  monochrome?: boolean
  windowFunction?: typeof possibleWindowFuncs[number]
  contrast?: number
}

export const getMediaLink = (options: GetMediaLinkOptions): string => {
  const dateFormat = 'YYYYMMDDTHHMMssSSSZ'
  const filename: string[] = []

  filename.push(`${options.streamId}_t${dayjs.utc(options.start).format(dateFormat)}.${dayjs.utc(options.end).format(dateFormat)}`)
  filename.push(`f${options.filetype}`)

  if (options.frequency != null) {
    filename.push(`r${options.frequency === 'full' ? options.frequency : `${options.frequency.min}.${options.frequency.max}`}`)
  }

  if (options.gain != null) {
    filename.push(`g${options.gain}`)
  }

  if (options.dimension != null) {
    filename.push(`d${options.dimension.width}.${options.dimension.height}`)
  }

  if (options.monochrome != null) {
    filename.push(`m${options.monochrome ? 'true' : 'false'}`)
  }

  if (options.windowFunction != null) {
    filename.push(`w${options.windowFunction}`)
  }

  if (options.contrast != null) {
    filename.push(`z${options.contrast}`)
  }

  return `${filename.join('_')}.${options.fileExtension}`
}
