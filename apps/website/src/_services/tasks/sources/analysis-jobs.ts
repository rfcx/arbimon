/**
 * Analysis-jobs TaskSource — surfaces CNN analysis jobs for the current
 * project in a floating tray, alongside uploads.
 *
 * Second consumer of the task framework, and the one that stresses it in
 * the ways uploads don't:
 *   - not client-initiated: jobs may already be running on arrival
 *   - polled (30s), not event-driven — later swappable for ADR-021 SSE with
 *     zero tray changes (the source's reactive state is all the tray sees)
 *   - no byte progress: uses minutesCompleted/minutesTotal
 *   - navigate-not-manipulate: per-item "Open" → job detail page
 *
 * SCOPE (2026-07-16): CURRENT PROJECT only — the classifier-jobs API is
 * project-scoped (`/jobs?project=`). A cross-project "all my jobs" view is a
 * backend follow-up (needs a user-scoped jobs endpoint); when it exists,
 * only `fetchJobs()` below changes.
 *
 * VISIBILITY: only jobs that are running/queued, OR finished within the last
 * RECENT_WINDOW_MS — so the tray reflects live activity, not a project's full
 * job history.
 */
import { type AxiosInstance } from 'axios'
import { computed, ref, watch } from 'vue'
import { type App } from 'vue'

import { type ClassifierJob, apiBioGetClassifierJobs, CLASSIFIER_JOB_LABELS } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { hasFeatureAccess } from '~/access/entitlements'
import { registerTaskSource } from '../task-center'
import { type TaskItem, type TaskItemState, type TaskSource } from '../types'

// Job status codes (CLASSIFIER_JOB_LABELS): 0 queued, 20 running, 30 done,
// 40 error, 50 cancelled, 60 awaiting-cancellation.
const ACTIVE_STATUSES = new Set([0, 20, 60])
const RECENT_WINDOW_MS = 10 * 60 * 1000
const POLL_INTERVAL_MS = 30_000
const MAX_VISIBLE_ITEMS = 6

interface JobsContext {
  getApiClient: () => AxiosInstance | undefined
  getProjectIdCore: () => string | undefined
  getProjectSlug: () => string | undefined
  getUserEmail: () => string | undefined
  navigate: (path: string) => void
}

// Injected once at app boot (keeps this module free of Vue-app singletons).
let ctx: JobsContext | undefined

const jobs = ref<ClassifierJob[]>([])
let pollTimer: ReturnType<typeof setInterval> | undefined

const isRecentlyFinished = (job: ClassifierJob): boolean => {
  if (ACTIVE_STATUSES.has(job.status)) return false
  const finished = job.completedAt ?? job.createdAt
  return Date.now() - new Date(finished).getTime() < RECENT_WINDOW_MS
}

const relevantJobs = computed(() =>
  jobs.value
    .filter(job => ACTIVE_STATUSES.has(job.status) || isRecentlyFinished(job))
    .sort((a, b) => {
      // active first, then most recent
      const aActive = ACTIVE_STATUSES.has(a.status) ? 0 : 1
      const bActive = ACTIVE_STATUSES.has(b.status) ? 0 : 1
      if (aActive !== bActive) return aActive - bActive
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
)

const fetchJobs = async (): Promise<void> => {
  const apiClient = ctx?.getApiClient()
  const projectId = ctx?.getProjectIdCore()
  // Don't poll for users who can't see the tray anyway (belt-and-braces with
  // the render-time gate in task-tray-stack).
  if (!hasFeatureAccess('analysisJobsTray', ctx?.getUserEmail())) {
    jobs.value = []
    return
  }
  if (apiClient === undefined || projectId === undefined || projectId === '') {
    jobs.value = []
    return
  }
  try {
    const result = await apiBioGetClassifierJobs(apiClient, projectId, 'me')
    jobs.value = (result as unknown as ClassifierJob[]) ?? []
  } catch {
    // best-effort surface; keep the last good list on a transient error
  }
}

const jobStateToTaskState = (job: ClassifierJob): TaskItemState => {
  if (ACTIVE_STATUSES.has(job.status)) return job.status === 0 ? 'pending' : 'active'
  if (job.status === 40) return 'failed'
  return 'done' // done / cancelled
}

const toTaskItem = (job: ClassifierJob): TaskItem => {
  const label = job.classifier?.name !== undefined ? `${job.classifier.name} v${job.classifier.version}` : `Job #${job.id}`
  const pct = job.minutesTotal > 0 ? job.minutesCompleted / job.minutesTotal : undefined
  const statusLabel = CLASSIFIER_JOB_LABELS[job.status] ?? 'unknown'
  const slug = ctx?.getProjectSlug()
  return {
    id: `job-${job.id}`,
    label,
    state: jobStateToTaskState(job),
    progress: job.status === 20 ? pct : undefined,
    detail: job.status === 20 && pct !== undefined ? `${Math.round(pct * 100)}% · ${statusLabel}` : statusLabel,
    actions: slug !== undefined
      ? [{
          id: 'open',
          label: 'Open',
          run: () => { ctx?.navigate(`/p/${slug}/analysis/cnn/detail/${job.id}`) }
        }]
      : undefined
  }
}

const analysisJobsSource: TaskSource = {
  id: 'analysis-jobs',
  label: 'Analyses',
  // Allow-list gated (beta): only shown to entitled users (see ~/access).
  requiresFeature: 'analysisJobsTray',
  visible: computed(() => relevantJobs.value.length > 0),
  summary: computed(() => {
    const active = relevantJobs.value.filter(job => ACTIVE_STATUSES.has(job.status)).length
    const failed = relevantJobs.value.filter(job => job.status === 40).length
    const done = relevantJobs.value.filter(job => job.status === 30).length
    const headline = active > 0
      ? `${active} analysis${active === 1 ? '' : 'es'} running…`
      : failed > 0
        ? `Analyses finished (${failed} failed)`
        : 'Analyses complete'
    // Aggregate % across active jobs (minutes-weighted).
    const activeJobs = relevantJobs.value.filter(job => job.status === 20 && job.minutesTotal > 0)
    let progressPercent: number | undefined
    if (activeJobs.length > 0) {
      const total = activeJobs.reduce((sum, job) => sum + job.minutesTotal, 0)
      const completed = activeJobs.reduce((sum, job) => sum + job.minutesCompleted, 0)
      progressPercent = total > 0 ? Math.round((completed / total) * 100) : undefined
    }
    return { activeCount: active, doneCount: done, failedCount: failed, progressPercent, headline }
  }),
  items: computed(() => relevantJobs.value.slice(0, MAX_VISIBLE_ITEMS).map(toTaskItem)),
  pageRoute: computed(() => {
    const slug = ctx?.getProjectSlug()
    return slug !== undefined ? `/p/${slug}/analysis/cnn` : undefined
  }),
  pageLabel: 'View all'
}

/**
 * Install the analysis-jobs source. Called once from app boot with accessors
 * for the API client + current project + a navigate fn. Starts the poll loop
 * and re-fetches on project change.
 */
export const installAnalysisJobsSource = (_app: App, context: JobsContext): void => {
  ctx = context
  registerTaskSource(analysisJobsSource)

  const start = (): void => {
    if (pollTimer !== undefined) return
    void fetchJobs()
    pollTimer = setInterval(() => { void fetchJobs() }, POLL_INTERVAL_MS)
  }

  if (typeof window !== 'undefined') {
    start()
    // Re-fetch promptly when the active project changes.
    watch(() => ctx?.getProjectIdCore(), () => { void fetchJobs() })
  }
}
