import { Override } from '@rfcx-bio/utils/utility-types'

// States
interface LoadableLoading { isLoading: true }
interface LoadableError<E> { isError: true, error: E }
interface LoadableNoData { isNoData: true }
interface LoadableData<D> { isData: true, data: D }

// Union
type LoadableAll = LoadableLoading & LoadableError<unknown> & LoadableNoData & LoadableData<unknown>
type LoadableBase = { [K in keyof LoadableAll]: LoadableAll[K] extends true ? false : undefined }

export type Loadable<D, E = unknown> =
  Override<LoadableBase, LoadableLoading> |
  Override<LoadableBase, LoadableError<E>> |
  Override<LoadableBase, LoadableNoData> |
  Override<LoadableBase, LoadableData<D>>

// Helpers
const loadableBase: LoadableBase = {
  isLoading: false,
  isError: false,
  isNoData: false,
  isData: false,
  error: undefined,
  data: undefined
}

export const loadableLoading = (): Override<LoadableBase, LoadableLoading> =>
  ({ ...loadableBase, isLoading: true })

export const loadableError = <E = unknown> (error: E): Override<LoadableBase, LoadableError<E>> =>
  ({ ...loadableBase, isError: true, error })

export const loadableNoData = (): Override<LoadableBase, LoadableNoData> =>
  ({ ...loadableBase, isNoData: true })

export const loadableData = <D> (data: D): Override<LoadableBase, LoadableData<D>> =>
  ({ ...loadableBase, isData: true, data })
