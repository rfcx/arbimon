import { computed, ComputedRef, unref } from 'vue'
import { UseQueryReturnType } from 'vue-query'

import { Loadable } from './types'

export type IsDataFn<DataOrNo, Data extends DataOrNo> = (maybeData: DataOrNo) => maybeData is Data

export function queryAsLoadable <DataOrNo, Data extends DataOrNo, E> (query: UseQueryReturnType<DataOrNo, E>, isDataFn: IsDataFn<DataOrNo, Data>): ComputedRef<Loadable<Data, E>> {
  return computed(() => {
    const { isLoading, isError, error, data } = query

    // TODO: Factor out common property values as defaults?!
    if (isLoading.value) {
      return {
        isLoading: true,
        isError: false,
        isNoData: false,
        isData: false,
        error: undefined,
        data: undefined
      }
    }

    if (isError.value) {
      return {
        isLoading: false,
        isError: true,
        isNoData: false,
        isData: false,
        error: unref(error) as E,
        data: undefined
      }
    }

    const maybeData = unref(data) as DataOrNo
    if (!isDataFn(maybeData)) {
      return {
        isLoading: false,
        isError: false,
        isNoData: true,
        isData: false,
        error: undefined,
        data: undefined
      }
    }

    return {
      isLoading: false,
      isError: false,
      isNoData: false,
      isData: true,
      error: undefined,
      data: maybeData
    }
  })
}
