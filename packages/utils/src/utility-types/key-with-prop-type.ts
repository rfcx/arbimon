export type KeyWithPropType<T, PropType> = {
  [K in keyof T]-?: Required<T>[K] extends PropType ? K : never
}[keyof T]
