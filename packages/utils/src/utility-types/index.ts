export type KeyWithPropType<T, PropType> = {
  [K in keyof T]-?: Required<T>[K] extends PropType ? K : never
}[keyof T]

export type ValueOf<T> = T[keyof T]

type Impossible<K extends keyof any> = { [P in K]: never}
export type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>
