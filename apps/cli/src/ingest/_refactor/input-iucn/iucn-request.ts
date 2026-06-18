import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { setTimeout as asyncTimeout } from 'node:timers/promises'

// Descriptive User-Agent. Wikimedia already required this (see input-wiki/
// user-agent.ts); IUCN is friendlier to identified clients too, and it keeps
// our outbound calls attributable + contactable.
export const IUCN_USER_AGENT = 'BiodiversityCLI/1.0 (https://github.com/rfcx/arbimon; support@rfcx.org)'

const MAX_RETRIES = 4
const BASE_DELAY_MS = 2_000

const parseRetryAfterMs = (res: AxiosResponse | undefined): number | undefined => {
  const ra = res?.headers?.['retry-after']
  if (ra == null) return undefined
  const secs = Number(ra)
  if (!Number.isNaN(secs)) return secs * 1_000
  const when = Date.parse(String(ra))
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now())
  return undefined
}

/**
 * IUCN HTTP GET with a descriptive User-Agent + retry/backoff on 429 (and 5xx).
 *
 * IUCN rate-limits aggressively; the daily sync was hammering it and getting a
 * flood of 429s with no backoff, which both slowed throughput and risked
 * incomplete data. This honors `Retry-After` when present, otherwise uses
 * exponential backoff. Non-retryable statuses (e.g. 404) are thrown straight
 * back so existing `.catch(logError(...))` handling is unchanged.
 */
export async function iucnRequest <T> (config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const merged: AxiosRequestConfig = {
    ...config,
    headers: { 'User-Agent': IUCN_USER_AGENT, ...config.headers }
  }

  let attempt = 0
  let delay = BASE_DELAY_MS
  for (;;) {
    try {
      return await axios.request<T>(merged)
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      const retryable = status === 429 || (status !== undefined && status >= 500)
      if (!retryable || attempt >= MAX_RETRIES) throw error

      const waitMs = parseRetryAfterMs(axios.isAxiosError(error) ? error.response : undefined) ?? delay
      console.info(`[iucn-retry] ${status} — backing off ${Math.round(waitMs / 1000)}s (attempt ${attempt + 1}/${MAX_RETRIES})`)
      await asyncTimeout(waitMs)
      delay *= 2
      attempt++
    }
  }
}
