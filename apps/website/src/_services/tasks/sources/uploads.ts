/**
 * Uploads TaskSource — adapts the app-wide upload engine singleton
 * (~/upload) to the generic task-tray contract. The engine itself is
 * untouched; this is a pure view-model mapping.
 */
import { computed } from 'vue'

import { type UploadItem, type UploadItemState } from '@rfcx-bio/upload-engine'

import { activeCount, engine, engineRunning, hasQueue, items, metricsProjectSlug, refreshItems, stats, uploadStore } from '~/upload'
import { registerTaskSource } from '../task-center'
import { type TaskItem, type TaskItemState, type TaskSource } from '../types'

const STATE_MAP: Record<UploadItemState, TaskItemState> = {
  analyzing: 'active',
  staged: 'pending',
  cancelled: 'failed',
  queued: 'pending',
  preparing: 'active',
  ready: 'pending',
  signing: 'active',
  signed: 'pending',
  uploading: 'active',
  uploaded: 'active', // server-side processing still in flight
  ingested: 'done',
  duplicate: 'done',
  failed: 'failed',
  rejected: 'failed',
  paused: 'pending'
}

const DETAIL_MAP: Partial<Record<UploadItemState, string>> = {
  analyzing: 'analyzing…',
  staged: 'staged — press Start on the uploader page',
  cancelled: 'cancelled',
  queued: 'queued',
  preparing: 'preparing…',
  ready: 'ready',
  signing: 'requesting URL…',
  signed: 'waiting to upload',
  uploaded: 'processing…',
  ingested: 'complete',
  duplicate: 'already uploaded — skipped',
  paused: 'paused'
}

const DISPLAY_ORDER: Record<UploadItemState, number> = {
  uploading: 0,
  uploaded: 1,
  signing: 2,
  signed: 3,
  preparing: 4,
  analyzing: 5,
  queued: 6,
  ready: 7,
  staged: 8,
  failed: 9,
  rejected: 10,
  cancelled: 11,
  duplicate: 12,
  ingested: 13,
  paused: 14
}

const MAX_VISIBLE_ITEMS = 6

const toTaskItem = (item: UploadItem): TaskItem => ({
  id: item.id,
  label: item.filename,
  state: STATE_MAP[item.state],
  progress: item.state === 'uploading' ? item.progress : undefined,
  detail: item.state === 'failed' || item.state === 'rejected' || item.state === 'cancelled'
    ? (item.error ?? 'failed')
    : DETAIL_MAP[item.state]
})

const uploadsSource: TaskSource = {
  id: 'uploads',
  label: 'Uploads',
  visible: computed(() => hasQueue.value),
  summary: computed(() => {
    const active = activeCount.value
    const done = stats.value.ingested + stats.value.duplicate
    const failed = stats.value.failed + stats.value.rejected
    const headline = active > 0
      ? `Uploading ${active} file${active === 1 ? '' : 's'}…`
      : failed > 0
        ? `Uploads finished (${failed} failed)`
        : 'Uploads complete'
    return {
      activeCount: active,
      doneCount: done,
      failedCount: failed,
      progressPercent: stats.value.bytesTotal === 0
        ? undefined
        : Math.round((stats.value.bytesUploaded / stats.value.bytesTotal) * 100),
      headline
    }
  }),
  items: computed(() =>
    [...items.value]
      .sort((a, b) => DISPLAY_ORDER[a.state] - DISPLAY_ORDER[b.state])
      .slice(0, MAX_VISIBLE_ITEMS)
      .map(toTaskItem)
  ),
  actions: computed(() => {
    const active = activeCount.value
    const stalledOrFailed =
      stats.value.failed + stats.value.uploading + stats.value.signing + stats.value.preparing
    return [
      // Un-stick a queue stranded by a network drop / tab close. Mirrors the
      // panel's "Retry failed" (2026-08-03): recoverStalled() returns items
      // orphaned in a transient in-flight state, which retry() alone cannot
      // see because it only accepts `failed`/`rejected`.
      ...(stalledOrFailed > 0
        ? [{
            id: 'retry-resume',
            label: 'Retry / resume',
            run: async () => {
              await engine.recoverStalled()
              const failed = await uploadStore.list(['failed'])
              for (const item of failed) await engine.retry(item.id)
              engine.start()
              await refreshItems()
            }
          }]
        : []),
      ...(active > 0
        ? [{
            id: 'pause-resume',
            label: engineRunning.value ? 'Pause' : 'Resume',
            run: async () => { engineRunning.value ? await engine.pause() : engine.start() }
          }]
        : [{
            id: 'clear',
            label: 'Clear',
            run: async () => {
              await uploadStore.clearTerminal()
              await refreshItems()
            }
          }])
    ]
  }),
  // Project-scoped page (2026-08-12 rebuild). Falls back to home when no
  // project has bound the uploader yet (queue restored before any visit).
  pageRoute: computed(() => metricsProjectSlug.value !== undefined
    ? `/p/${metricsProjectSlug.value}/import-recordings`
    : '/'),
  pageLabel: 'Open uploader'
}

registerTaskSource(uploadsSource)
