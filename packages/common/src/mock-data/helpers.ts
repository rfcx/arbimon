const MOCK_FLIGHT_TIME = 750

export const simulateDelay = async <T>(result: T, delay: number | undefined = undefined): Promise<T> =>
  delay === 0
    ? result
    : await new Promise((resolve) => setTimeout(() => { resolve(result) }, delay ?? MOCK_FLIGHT_TIME))
