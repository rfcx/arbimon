/**
 * Uploads TaskSource — adapts the app-wide upload engine singleton
 * (~/upload) to the generic task-tray contract. The engine itself is
 * untouched; this is a pure view-model mapping.
 */
import { computed } from 'vue'

import { type UploadItem } from '@rfcx-bio/upload-engine'

import { activeCount, engine, engineRunning, hasQueue, items, metricsProjectSlug, refreshItems, stats, uploadStore } from '~/upload'
import { registerTaskSource } from '../task-center'
import { type TaskItem, type TaskSource } from '../types'

/**
 * Roll the queue up into ONE ROW PER PROJECT (operator 2026-08-18).
 *
 * WHY NOT PER-FILE: the drawer is an at-a-glance surface reached from the nav
 * while doing something else. A bulk upload is routinely hundreds of files, so
 * a per-file list could only ever show an arbitrary slice (it was capped at 6)
 * -- answering "what is file #4 doing?", which is not the question being asked
 * there. The uploader page remains the per-file view.
 *
 * Aggregate semantics per project:
 *   progress  bytes uploaded / bytes total, so a few large files cannot be
 *             misrepresented by a file-count average
 *   state     failed if anything failed, else active if anything is in flight,
 *             else done -- worst case wins, so a problem is never hidden
 *             behind mostly-green siblings
 */
const IN_FLIGHT: Array<UploadItem['state']> =
  ['queued', 'preparing', 'ready', 'signing', 'signed', 'uploading', 'uploaded']
const FAILED_STATES: Array<UploadItem['state']> = ['failed', 'rejected']

const toProjectItems = (all: UploadItem[]): TaskItem[] => {
  const byProject = new Map<string, UploadItem[]>()
  for (const item of all) {
    const key = item.projectSlug ?? 'unknown'
    const bucket = byProject.get(key)
    if (bucket === undefined) byProject.set(key, [item])
    else bucket.push(item)
  }

  return [...byProject.entries()].map(([slug, rows]) => {
    const bytesTotal = rows.reduce((sum, r) => sum + r.fileSizeBytes, 0)
    const bytesDone = rows.reduce((sum, r) => {
      if (r.state === 'ingested' || r.state === 'duplicate' || r.state === 'uploaded') return sum + r.fileSizeBytes
      if (r.state === 'uploading') return sum + r.fileSizeBytes * (r.progress ?? 0)
      return sum
    }, 0)

    const failed = rows.filter(r => FAILED_STATES.includes(r.state)).length
    const active = rows.filter(r => IN_FLIGHT.includes(r.state)).length
    const finished = rows.filter(r => r.state === 'ingested' || r.state === 'duplicate').length

    const state: TaskItem['state'] =
      failed > 0 ? 'failed' : active > 0 ? 'active' : finished > 0 ? 'done' : 'pending'

    const detail = failed > 0
      ? `${finished}/${rows.length} done · ${failed} failed`
      : active > 0
        ? `${finished}/${rows.length} done`
        : `${rows.length} recording${rows.length === 1 ? '' : 's'}`

    return {
      id: `project:${slug}`,
      label: slug,
      state,
      progress: bytesTotal === 0 ? undefined : bytesDone / bytesTotal,
      detail
    }
  })
}

const uploadsSource: TaskSource = {
  id: 'uploads',
  label: 'Uploads',
  visible: computed(() => hasQueue.value),
  summary: computed(() => {
    const active = activeCount.value
    const done = stats.value.ingested + stats.value.duplicate
    const failed = stats.value.failed + stats.value.rejected
    const headline = active > 0
      ? `Uploading ${active} recording${active === 1 ? '' : 's'}…`
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
  // Per-PROJECT aggregate rows (see toProjectItems). No cap needed: a user has
  // a handful of projects, not hundreds of them.
  items: computed(() => toProjectItems(items.value)),
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
