type AttributeConstants<T> = Record<string, Array<keyof T & string>>

/**
 * Variation of the `satifies` pattern
 */
export const attributes =
  <TWide> () =>
  <TNarrow extends AttributeConstants<TWide>>(narrow: TNarrow) => narrow

/**
 * To get filtered types matching attribute lists
 */
export type AttributeTypes<T, C extends AttributeConstants<T>> = {
  [K in keyof C]: Pick<T, C[K][number]>
}
