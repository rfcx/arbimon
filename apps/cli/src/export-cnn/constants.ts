/**
 * Amout of rows one single file export can have.
 */
export const CSV_ROW_LIMIT = 10_000

/**
 * How many detections can one query fetch to prevent API being overwhelmed.
 */
export const QUERY_LIMIT = 1_000

/**
 * To reduce the load on the backend, we will limit the date range upon querying
 * the API to 15 days. The API will be queried chunk by chunk, then all data will
 * be joined together in the end.
 */
export const DATE_CHUNKING_DURATION = 15

export const DATE_FORMAT = 'YYYY-MM-DD'

export const CACHE_DIRECTORY = ['/', 'tmp', 'rfcx']
