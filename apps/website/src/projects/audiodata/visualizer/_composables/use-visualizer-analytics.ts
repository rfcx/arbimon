// Visualizer analytics — detailed PostHog instrumentation for the SPA
// visualizer page. Thin wrapper over the app-wide `track()` seam
// (`~/analytics`) that stamps a consistent context bundle onto every event and
// namespaces them `visualizer_*`.
//
// Design + taxonomy: rfcx-local runbooks/DESIGN-visualizer-posthog-analytics-2026-07-19.md.
//
// Guarantees:
//  - Routes through `track()`, which is env-gated (VITE_POSTHOG_ENABLED) and
//    swallow-all — analytics can NEVER throw into the visualizer or fire when
//    disabled.
//  - No global listeners. High-frequency intents (zoom, playback) must be
//    debounced by the CALLER or via `debounced()` here; never emit per frame.
//    (#2461 CPU gate.)
//  - Properties are ids/enums/counts/durations only — no PII, no audio bytes.

import { type ComputedRef, computed, unref } from 'vue'

import { track } from '~/analytics'

export interface VisualizerAnalyticsContext {
  projectSlug: ComputedRef<string | undefined> | (() => string | undefined)
  browserType: ComputedRef<string | undefined> | (() => string | undefined)
  recordingId?: ComputedRef<string | number | undefined> | (() => string | number | undefined)
  playlistId?: ComputedRef<string | number | undefined> | (() => string | number | undefined)
  soundscapeId?: ComputedRef<string | number | undefined> | (() => string | number | undefined)
}

const read = <T>(v: ComputedRef<T> | (() => T) | undefined): T | undefined => {
  if (v === undefined) return undefined
  return typeof v === 'function' ? (v as () => T)() : unref(v)
}

export const useVisualizerAnalytics = (ctx: VisualizerAnalyticsContext): {
  trackVis: (event: string, props?: Record<string, unknown>) => void
  debounced: (key: string, ms: number, fn: () => void) => void
} => {
  const coreProps = computed<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {}
    const slug = read(ctx.projectSlug); if (slug !== undefined) out.project_slug = slug
    const bt = read(ctx.browserType); if (bt !== undefined) out.browser_type = bt
    const rec = read(ctx.recordingId); if (rec !== undefined && rec !== '') out.recording_id = Number(rec) || rec
    const pl = read(ctx.playlistId); if (pl !== undefined && pl !== '') out.playlist_id = Number(pl) || pl
    const ss = read(ctx.soundscapeId); if (ss !== undefined && ss !== '') out.soundscape_id = Number(ss) || ss
    return out
  })

  // Emit `visualizer_<event>` with the core context bundle + call-site props.
  const trackVis = (event: string, props?: Record<string, unknown>): void => {
    track(`visualizer_${event}`, { ...coreProps.value, ...(props ?? {}) })
  }

  // Trailing-edge debounce keyed by name, for throttling high-frequency intents.
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const debounced = (key: string, ms: number, fn: () => void): void => {
    const existing = timers.get(key)
    if (existing) clearTimeout(existing)
    timers.set(key, setTimeout(() => { timers.delete(key); fn() }, ms))
  }

  return { trackVis, debounced }
}
