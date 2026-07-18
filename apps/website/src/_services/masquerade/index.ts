/**
 * Superuser masquerade — website (modern Vue) client.
 *
 * The LEGACY app owns masquerade state (an express/Redis session keyed by the
 * shared arbimon.org cookie). The modern site is served from the SAME origin
 * (arbimon.org), so a same-origin call to `/legacy-api/masquerade/*` carries
 * that cookie automatically and sees the exact same session — no second
 * source of truth. This module:
 *
 *   - polls `/legacy-api/masquerade/status` for the active target + realIsSuper;
 *   - exposes start/stop/search (thin wrappers over the legacy endpoints);
 *   - publishes `masqueradeTargetEmail` — the bio api-client interceptor adds
 *     `X-Masquerade-Email: <target>` to every bio-api request while active, so
 *     the modern UI shows exactly what the target sees. bio-api re-verifies the
 *     real super identity server-side (see apps/api/.../auth0/masquerade.ts).
 *
 * Start/stop are done via the legacy endpoints so BOTH stacks flip together;
 * a full-page reload after either makes every already-mounted view re-fetch
 * under the new identity.
 */
import { type AxiosInstance } from 'axios'
import { computed, ref } from 'vue'

export interface MasqueradeTarget {
  id: number
  email: string
  name: string
}

export interface MasqueradeStatus {
  active: boolean
  target: MasqueradeTarget | null
  expiresAt: number | null
  realIsSuper: boolean
}

export interface MasqueradeSearchResult {
  id: number
  email: string
  username: string
  name: string
  isSuper: boolean
  selectable: boolean
}

const status = ref<MasqueradeStatus>({ active: false, target: null, expiresAt: null, realIsSuper: false })

/** Reactive: the email to stamp on bio-api requests, or null when inactive. */
export const masqueradeStatus = computed(() => status.value)
export const masqueradeTargetEmail = computed<string | null>(() =>
  status.value.active && status.value.target !== null ? status.value.target.email : null
)

// The legacy api client (same-origin arbimon.org). Injected once at boot so
// this module stays free of Vue-app singletons.
let legacyClient: AxiosInstance | undefined

export const installMasqueradeClient = (client: AxiosInstance): void => {
  legacyClient = client
}

export const refreshMasqueradeStatus = async (): Promise<void> => {
  if (legacyClient === undefined) return
  try {
    const res = await legacyClient.get<MasqueradeStatus>('/legacy-api/masquerade/status', { withCredentials: true })
    status.value = res.data
  } catch {
    // best-effort; keep last-known status on transient failure
  }
}

export const searchMasqueradeUsers = async (q: string): Promise<MasqueradeSearchResult[]> => {
  if (legacyClient === undefined || q.trim().length < 2) return []
  try {
    const res = await legacyClient.get<MasqueradeSearchResult[]>('/legacy-api/masquerade/search', {
      params: { q: q.trim() },
      withCredentials: true
    })
    return res.data ?? []
  } catch {
    return []
  }
}

export const startMasquerade = async (userId: number): Promise<boolean> => {
  if (legacyClient === undefined) return false
  try {
    await legacyClient.post('/legacy-api/masquerade/start', { user_id: userId }, { withCredentials: true })
    return true
  } catch {
    return false
  }
}

export const stopMasquerade = async (): Promise<void> => {
  if (legacyClient === undefined) return
  try {
    await legacyClient.post('/legacy-api/masquerade/stop', {}, { withCredentials: true })
  } catch {
    // ignore; caller reloads regardless
  }
}
