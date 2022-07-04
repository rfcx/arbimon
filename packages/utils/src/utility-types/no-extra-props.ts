type Impossible<K extends keyof any> = { [P in K]: never}

export type NoExtraProps<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>
