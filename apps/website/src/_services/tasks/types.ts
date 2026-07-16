/**
 * Task framework — generic background-work surfaces for the floating trays.
 *
 * A TaskSource is anything that owns a set of long-running work items the
 * user cares about while doing something else: uploads, analysis jobs,
 * exports, backups… Each registered source renders as its OWN floating
 * tray; trays stack vertically (bottom-right) and collapse independently.
 *
 * The tray shell is intentionally dumb: it renders whatever reactive state
 * the source exposes. How a source gets its data (local engine events,
 * polling, SSE) is entirely its own business — swapping polling for push
 * later requires zero tray changes.
 */
import { type ComputedRef } from 'vue'

import { type GatedFeature } from '~/access/entitlements'

export type TaskItemState = 'pending' | 'active' | 'done' | 'failed'

export interface TaskAction {
  id: string
  label: string
  /** Visual emphasis; default 'secondary'. */
  kind?: 'primary' | 'secondary' | 'danger'
  /** Disable (e.g. while an async action is in flight). */
  disabled?: boolean
  run: () => void | Promise<void>
}

export interface TaskItem {
  id: string
  /** Primary row text (filename, job name…). */
  label: string
  state: TaskItemState
  /** 0..1 byte/step progress; omit for indeterminate (state chip shown). */
  progress?: number
  /** Small secondary text (state detail, error, ETA…). */
  detail?: string
  /** Per-item actions (e.g. open in Visualizer, open job page). */
  actions?: TaskAction[]
}

export interface TaskSummary {
  /** Items still in flight (drives the header verb + activity dot). */
  activeCount: number
  doneCount: number
  failedCount: number
  /** Aggregate 0..100 when meaningful (uploads: bytes; jobs: mean %). */
  progressPercent?: number
  /** One-line header, e.g. "Uploading 3 files…" / "2 analyses running". */
  headline: string
}

export interface TaskSource {
  /** Stable id ('uploads', 'analysis-jobs'…) — also the collapse-state key. */
  id: string
  /** Tray title ("Uploads", "Analyses"). */
  label: string
  /**
   * Optional allow-list feature gate. When set, the tray is only rendered for
   * users entitled to that feature (see ~/access). VISIBILITY gating only —
   * the source's data must still be safe for any user who could reach it.
   */
  requiresFeature?: GatedFeature
  /** Whether this source's tray should be shown at all. */
  visible: ComputedRef<boolean>
  summary: ComputedRef<TaskSummary>
  /** Display-ready items: pre-sorted, capped by the source. */
  items: ComputedRef<TaskItem[]>
  /** Tray-level actions (pause/resume, clear…). */
  actions?: ComputedRef<TaskAction[]>
  /** Optional route to the source's full page (renders an "Open" link). */
  pageRoute?: ComputedRef<string | undefined>
  /** Label for the page link. Default "Open". */
  pageLabel?: string
}
