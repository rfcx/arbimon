/**
 * Uploads TaskSource — adapts the app-wide upload engine singleton
 * (~/upload) to the generic task-tray contract. The engine itself is
 * untouched; this is a pure view-model mapping.
 */
import { computed } from 'vue'

import { type UploadItem, type UploadItemState } from '@rfcx-bio/upload-engine'

import { activeCount, engine, engineRunning, hasQueue, items, refreshItems, stats, uploadStore } from '~/upload'
import { registerTaskSource } from '../task-center'
import { type TaskItem, type TaskItemState, type TaskSource } from '../types'

const STATE_MAP: Record<UploadItemState, TaskItemState> = {
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
  queued: 'queued',
  preparing: 'preparing…',
  ready: 'ready',
  signing: 'requesting URL…',
  signed: 'waiting to upload',
  uploaded: 'processing…',
  ingested: 'complete',
  duplicate: 'duplicate (already ingested)',
  paused: 'paused'
}

const DISPLAY_ORDER: Record<UploadItemState, number> = {
  uploading: 0,
  uploaded: 1,
  signing: 2,
  signed: 3,
  preparing: 4,
  queued: 5,
  ready: 6,
  failed: 7,
  rejected: 8,
  duplicate: 9,
  ingested: 10,
  paused: 11
}

const MAX_VISIBLE_ITEMS = 6

const toTaskItem = (item: UploadItem): TaskItem => ({
  id: item.id,
  label: item.filename,
  state: STATE_MAP[item.state],
  progress: item.state === 'uploading' ? item.progress : undefined,
  detail: item.state === 'failed' || item.state === 'rejected'
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
    return [
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
  pageRoute: computed(() => '/import-recordings-new'),
  pageLabel: 'Open uploader'
}

registerTaskSource(uploadsSource)
