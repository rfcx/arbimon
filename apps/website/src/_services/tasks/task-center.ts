/**
 * Task center — the registry of TaskSources.
 *
 * Sources self-register at module init (side-effect import from app boot).
 * The tray stack renders every registered source whose `visible` is true,
 * in registration order (first registered = bottom of the stack).
 */
import { shallowReactive } from 'vue'

import { type TaskSource } from './types'

// shallowReactive: the array itself is reactive (register triggers re-render)
// but sources are NOT deep-proxied — their ComputedRefs stay intact (a deep
// reactive() would auto-unwrap them and break the TaskSource contract).
const sources = shallowReactive<TaskSource[]>([])

export const registerTaskSource = (source: TaskSource): void => {
  if (sources.some(existing => existing.id === source.id)) return
  sources.push(source)
}

export const taskSources = sources

// -- per-tray collapse persistence (survives reloads; sessionStorage) --------
const collapseKey = (sourceId: string): string => `task-tray-collapsed:${sourceId}`

export const loadCollapsed = (sourceId: string): boolean => {
  try {
    return sessionStorage.getItem(collapseKey(sourceId)) === '1'
  } catch {
    return false
  }
}

export const saveCollapsed = (sourceId: string, collapsed: boolean): void => {
  try {
    sessionStorage.setItem(collapseKey(sourceId), collapsed ? '1' : '0')
  } catch {}
}
