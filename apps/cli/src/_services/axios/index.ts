import axios from 'axios'

// TODO: Logging for successes

export const logError = (...info: string[]) => (error: unknown): undefined => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined

  if (status === 404) console.info(status, ...info, error)
  else console.error(status ?? '???', ...info, error)

  return undefined
}
