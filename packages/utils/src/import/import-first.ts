/**
 * I haven't worked out how to pass an absolute path to `await import(...)`
 * ...so I'm importing in the caller, and passing the import promise in
 */
export const getFirstFromImport = async <T> (importPromise: Promise<any>, defaultValue: T): Promise<T> =>
  await importPromise
    .then(res => Object.values(res as Record<string, T>)?.[0] ?? defaultValue)
    .catch(() => defaultValue)
