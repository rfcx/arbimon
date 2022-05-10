import { QueryFunction, QueryKey } from 'react-query'
import { useQuery, UseQueryOptions, UseQueryReturnType } from 'vue-query'

const ONE_HOUR_IN_MILLIS = 3_600_000 // 60 * 60 * 1000

const DEFAULT_OPTIONS: Omit<UseQueryOptions<any, any, any, any>, 'queryKey' | 'queryFn'> = {
  staleTime: ONE_HOUR_IN_MILLIS
}

export function useApiQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey> (queryKey: QueryKey, queryFn: QueryFunction<TQueryFnData>, options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>): UseQueryReturnType<TData, TError> {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>(
    queryKey,
    queryFn,
    { ...DEFAULT_OPTIONS, ...options }
  )
}
