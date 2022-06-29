import { partition } from 'lodash-es'
import { SafeParseError, SafeParseReturnType, SafeParseSuccess } from 'zod'

export const parseArray = <In, Out>(items: In[], parser: (item: In) => SafeParseReturnType<In, Out>): [Array<[In, SafeParseSuccess<Out>]>, Array<[In, SafeParseError<In>]>] => {
  const result = partition(
    items.map(item => [item, parser(item)] as [In, SafeParseReturnType<In, Out>]),
    pair => pair[1].success
  )

  // lodash `partition` doesn't propagate type inferences based on the predicate (so we assert them)
  return result as [Array<[In, SafeParseSuccess<Out>]>, Array<[In, SafeParseError<In>]>]
}
