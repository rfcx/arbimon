export function mapIfDefined <In, Out> (maybeValue: In | undefined, mapFn: (value: In) => Out): Out | undefined {
  return maybeValue === undefined ? undefined : mapFn(maybeValue)
}
