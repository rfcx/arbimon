// Tile-loader semaphore.
//
// The visualizer renders N spectrogram tiles by mounting N <VisualizerTileImg>
// components and assigning each one a `/legacy-api/ingest/recordings/*.png`
// URL. Before this loader was introduced, every tile component fired
// `new Image(); image.src = url` synchronously inside an `{ immediate: true }`
// watcher, which produced N parallel HTTP requests in a single tick.
//
// The upstream `stream-asset` service that serves those PNGs serialises audio
// fetches per recording and degrades sharply under concurrency: empirically a
// single request returns in ~30 ms, but 20 concurrent requests against the
// same recording each take 9–13 s and a fraction return 500/504. When all N
// onload handlers then fire in a tight cluster, the main thread is blocked
// long enough to trip the `health.js-blocked` watchdog (>3 s of synchronous
// JS), causing the visualizer hang reported in #2461.
//
// This module exposes a tiny FIFO-ordered semaphore so each tile preload
// acquires a slot before issuing its request, with a small in-flight cap.
// Acquirers wait their turn rather than racing; cancellations (component
// unmount or `tileSrc` change) free the slot immediately.

const MAX_IN_FLIGHT_TILE_LOADS = 4

let inFlight = 0
const waiters: Array<(release: () => void) => void> = []

const makeRelease = (): (() => void) => {
  let released = false
  return () => {
    if (released) return
    released = true
    inFlight = Math.max(0, inFlight - 1)
    pump()
  }
}

const pump = (): void => {
  while (inFlight < MAX_IN_FLIGHT_TILE_LOADS && waiters.length > 0) {
    const next = waiters.shift()
    if (!next) break
    inFlight++
    next(makeRelease())
  }
}

/**
 * Acquire a tile-loader slot. Returns a promise that resolves with a
 * `release()` callback. Callers MUST invoke `release()` exactly once when
 * the tile preload settles (load or error) — or earlier, on cancellation,
 * to let queued tiles proceed.
 */
export const acquireTileSlot = async (): Promise<() => void> => {
  return await new Promise(resolve => {
    waiters.push(resolve)
    pump()
  })
}

/**
 * Snapshot of the semaphore state, exposed for tests and debugging.
 */
export const tileLoaderState = (): { inFlight: number, waiting: number, max: number } => ({
  inFlight,
  waiting: waiters.length,
  max: MAX_IN_FLIGHT_TILE_LOADS
})
