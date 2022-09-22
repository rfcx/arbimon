import { partition } from 'lodash-es'
import { SafeParseError, SafeParseReturnType, SafeParseSuccess } from 'zod'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { DetectionArbimon } from './parse-detection-arbimon-to-bio'
import { RecordingArbimon, RecordingDeletedArbimon } from './parse-recording-by-site-hour-arbimon-to-bio'

interface RecordingData {
  countsByMinute: number[][]
}

export const parseArray = <In, Out>(items: In[], parser: (item: In) => SafeParseReturnType<In, Out>): [Array<[In, SafeParseSuccess<Out>]>, Array<[In, SafeParseError<In>]>] => {
  const result = partition(
    items.map(item => [item, parser(item)] as [In, SafeParseReturnType<In, Out>]),
    pair => pair[1].success
  )

  // lodash `partition` doesn't propagate type inferences based on the predicate (so we assert them)
  return result as [Array<[In, SafeParseSuccess<Out>]>, Array<[In, SafeParseError<In>]>]
}

export const filterRepeatingDetectionMinutes = (group: Array<(RecordingArbimon | DetectionArbimon | RecordingDeletedArbimon)>): RecordingData => {
  return group.reduce((acc: any, cur: any) => {
    const minute = dayjs(cur.datetime).minute()
      // TODO check counts logic by unit testing
      const index = acc.countsByMinute.findIndex((pair: any) => pair[0] === minute)
      if (index === -1) {
        acc.countsByMinute.push([minute, 1])
      } else {
        acc.countsByMinute[index][1] = acc.countsByMinute[index][1] as number + 1
      }
      return acc
    }, { countsByMinute: [] as number[][] })
}
