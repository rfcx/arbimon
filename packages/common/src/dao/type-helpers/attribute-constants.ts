export type AttributeConstants<T> = Record<string, ReadonlyArray<keyof T>>

export type TypesFor<T, C extends AttributeConstants<T>> = {
  [K in keyof C]: Pick<T, C[K][number]>
}
