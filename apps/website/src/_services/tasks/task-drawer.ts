/**
 * Task-drawer open/closed state.
 *
 * WHY THIS IS A MODULE SINGLETON AND NOT COMPONENT STATE:
 * the drawer is rendered by `app-root.vue` (the only component mounted on EVERY
 * route) while its trigger lives in `side-bar.vue` (mounted only under
 * /p/:projectSlug). Two components in different subtrees, neither an ancestor
 * of the other, so the shared bit has to live outside both.
 *
 * MEASURED, not assumed: a route audit on the running demo (2026-08-18) found
 * the sidebar present on /p/... routes and ABSENT on /my-projects and
 * /account-settings. A drawer owned by the sidebar therefore disappeared on
 * exactly the pages a user visits between projects -- which is when a
 * long-running upload most needs checking. Hoisting the panel to app-root and
 * leaving only the TRIGGER in the nav is what makes "persists across all
 * navigation" true rather than aspirational.
 */
import { computed, ref } from 'vue'

import { taskSources } from './task-center'

const open = ref(false)

export const taskDrawerOpen = computed<boolean>(() => open.value)

export const openTaskDrawer = (): void => { open.value = true }
export const closeTaskDrawer = (): void => { open.value = false }
export const toggleTaskDrawer = (): void => { open.value = !open.value }

/**
 * Total in-flight items across every VISIBLE source — drives the nav badge.
 *
 * Uses each source's own `summary.activeCount` rather than counting items, so a
 * source that reports an aggregate (uploads is per-project, not per-file) is
 * not double-counted or under-counted.
 */
export const taskActiveCount = computed<number>(() =>
  taskSources
    .filter(source => source.visible.value)
    .reduce((sum, source) => sum + source.summary.value.activeCount, 0))
