import { computed, ComputedRef, unref } from 'vue'
import { UseQueryReturnType } from 'vue-query'

import { loadableData, loadableError, loadableLoading, loadableNoData } from '~/loadable'
import { Loadable } from './loadable'

export type IsDataFn<DataOrNo, Data extends DataOrNo> = (maybeData: DataOrNo) => maybeData is Data

export function queryAsLoadable <DataOrNo, Data extends DataOrNo, E> (query: UseQueryReturnType<DataOrNo, E>, isDataFn: IsDataFn<DataOrNo, Data>): ComputedRef<Loadable<Data, E>> {
  return computed(() => {
    const { isLoading, isError, error, data } = query
    const maybeData = unref(data) as DataOrNo

    if (isLoading.value) return loadableLoading()
    if (isError.value) return loadableError(unref(error) as E)
    if (!isDataFn(maybeData)) return loadableNoData()
    return loadableData(maybeData)
  })
}
