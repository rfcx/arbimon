/**
 * Masquerade TaskSource — a floating tray letting a superuser "view as" any
 * user on the MODERN site, staying in lockstep with the legacy app.
 *
 * State lives in the legacy Redis session (single source of truth); this
 * source polls `/legacy-api/masquerade/status` (same-origin) and mirrors the
 * active target into the bio api-client header via ~/masquerade. Start/stop
 * hit the legacy endpoints so both stacks flip together, then reload so every
 * mounted view re-fetches under the new identity.
 *
 * Unlike the other task sources this one is not about background work: it is
 * always visible to real supers (or while a masquerade is active) so the
 * super can start/stop from anywhere. Gated to supers by realIsSuper (the
 * legacy status endpoint's server-side check) — no client allow-list needed.
 */
import { computed, ref } from 'vue'
import { type App } from 'vue'

import { type MasqueradeSearchResult, masqueradeStatus, refreshMasqueradeStatus, searchMasqueradeUsers, startMasquerade, stopMasquerade } from '~/masquerade'
import { registerTaskSource } from '../task-center'
import { type TaskItem, type TaskSearchBox, type TaskSource } from '../types'

const POLL_INTERVAL_MS = 30_000

const searchQuery = ref('')
const searchResults = ref<MasqueradeSearchResult[]>([])
const searching = ref(false)
const busy = ref(false)
let searchDebounce: ReturnType<typeof setTimeout> | undefined

const runSearch = (q: string): void => {
  searchQuery.value = q
  if (searchDebounce !== undefined) clearTimeout(searchDebounce)
  const trimmed = q.trim()
  if (trimmed.length < 2) { searchResults.value = []; searching.value = false; return }
  searching.value = true
  searchDebounce = setTimeout(() => {
    void searchMasqueradeUsers(trimmed).then(rows => {
      searchResults.value = rows
      searching.value = false
    })
  }, 300)
}

const doStart = async (userId: number): Promise<void> => {
  if (busy.value) return
  busy.value = true
  const ok = await startMasquerade(userId)
  busy.value = false
  if (ok && typeof window !== 'undefined') window.location.reload()
}

const doStop = async (): Promise<void> => {
  if (busy.value) return
  busy.value = true
  await stopMasquerade()
  if (typeof window !== 'undefined') window.location.reload()
}

// Search results become "items" (the tray's item rows); each selectable row
// carries a "View" action that starts masquerade as that user.
const items = computed<TaskItem[]>(() => {
  const s = masqueradeStatus.value
  if (s.active && s.target !== null) {
    // While active: show the single target row (no search UI).
    return [{
      id: `masq-target-${s.target.id}`,
      label: s.target.name,
      state: 'active',
      detail: s.target.email
    }]
  }
  return searchResults.value.slice(0, 8).map<TaskItem>(u => ({
    id: `masq-user-${u.id}`,
    label: u.name + (u.isSuper ? ' (super)' : ''),
    state: u.selectable ? 'pending' : 'failed',
    detail: u.email,
    actions: u.selectable
      ? [{ id: 'view', label: 'View as', kind: 'primary', disabled: busy.value, run: () => { void doStart(u.id) } }]
      : undefined
  }))
})

const masqueradeSource: TaskSource = {
  id: 'masquerade',
  label: 'View as user',
  // Always available to real supers (or while masquerading) — the legacy
  // status endpoint decides realIsSuper server-side.
  visible: computed(() => masqueradeStatus.value.realIsSuper || masqueradeStatus.value.active),
  summary: computed(() => {
    const s = masqueradeStatus.value
    return {
      activeCount: s.active ? 1 : 0,
      doneCount: 0,
      failedCount: 0,
      headline: s.active && s.target !== null
        ? `Viewing as ${s.target.name}`
        : 'View as user'
    }
  }),
  items,
  // Free-text user picker. Present only while NOT masquerading (once active the
  // tray shows just the target + Stop). Kept undefined otherwise so the tray
  // omits the input.
  get searchBox (): TaskSearchBox | undefined {
    if (masqueradeStatus.value.active) return undefined
    return {
      placeholder: 'Search by email or username…',
      query: computed(() => searchQuery.value),
      onInput: (v: string) => { runSearch(v) }
    }
  },
  // Tray-level action: while active -> Stop. (Start happens per-row via the
  // item "View as" actions.)
  actions: computed(() => {
    const s = masqueradeStatus.value
    if (s.active) {
      return [{ id: 'stop', label: 'Stop viewing as user', kind: 'danger' as const, disabled: busy.value, run: () => { void doStop() } }]
    }
    return []
  })
}

/**
 * Install the masquerade source. Polls legacy status; registers the tray.
 */
export const installMasqueradeSource = (_app: App): void => {
  registerTaskSource(masqueradeSource)
  if (typeof window === 'undefined') return
  void refreshMasqueradeStatus()
  // Lives for the app lifetime (single-page app); no teardown needed.
  setInterval(() => {
    // First poll already ran; afterwards only keep polling for supers / while
    // masquerading (surfaces TTL expiry + cross-tab/legacy-side stop).
    const s = masqueradeStatus.value
    if (s.realIsSuper || s.active) void refreshMasqueradeStatus()
  }, POLL_INTERVAL_MS)
}
