import { setTimeout as asyncTimeout } from 'node:timers/promises'

/**
 * Retry a promise function to given retry amount,
 * each retry will extend the waiting time out by `current delay x 2`
 * @param fn the function that you wanted to call.
 * @param retries the amount of retry you want the function to do. Default is 5
 * @param initialDelay the amount of delay in milliseconds you want the function to do. This will get 2x every time an error has occured. Default is 10 seconds.
 *
 * @returns the result of `fn` if there's a successful call.
 * @throws any error from `fn` when the `retries` have reached.
 */
// @ts-expect-error since the while loop have safe conditions, it will not return `undefined`
export const retry = async <T>(fn: Promise<T>, retries = 5, initialDelay = 10_000): Promise<T> => {
  let attempt = 0
  let delay = initialDelay

  while (attempt < retries) {
    try {
      console.info('[retry] starting the call')
      const response = await fn

      console.info('[retry] the function successfully called.')
      return response
    } catch (error) {
      if (attempt < retries - 1) {
        console.info('[retry] request failed, retrying in', delay / 1000, 'seconds')
        await asyncTimeout(delay)
        delay += delay
      } else {
        console.info('[retry] error count exceeds retry amount, throwing the error')
        throw error
      }
    }

    attempt++
  }
}
