import axios, { AxiosResponse } from 'axios'

export const axiosGetLogMap = async <T, U> (url: string, mapFn: (t: T) => U | undefined | null, logContext: string[] = []): Promise<U | undefined> =>
  await axios.request<T>({ url })
    .then(logSuccess(logContext, mapFn))
    .catch(logError(logContext))

const logSuccess = <T extends any, U extends any> (context: string[], mapFn: (t: T) => U | undefined | null) => (response: AxiosResponse<T>): (U | undefined) => {
  // `map` to extract result
  const result = mapFn(response.data)

  // Log & return (no result)
  if (result === undefined || result === null) {
    console.info(response.status, ...context, '(no data)')
    return undefined
  }

  // Log & return (result)
  console.info(response.status, ...context)
  return result
}

const logError = (context: string[]) => (error: unknown): undefined => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined

  if (status === 404) console.info(status, ...context, '(no data)')
  else console.error(status ?? '???', ...context, '(no data)', error)

  return undefined
}
