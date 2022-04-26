// TODO: Factor out common property types as base type?!
export type Loadable<T, E = Error> =
  { isLoading: true, isError: false, error: undefined, isNoData: false, isData: false, data: undefined } |
  { isLoading: false, isError: true, error: E, isNoData: false, isData: false, data: undefined } |
  { isLoading: false, isError: false, error: undefined, isNoData: true, isData: false, data: undefined } |
  { isLoading: false, isError: false, error: undefined, isNoData: false, isData: true, data: T }
