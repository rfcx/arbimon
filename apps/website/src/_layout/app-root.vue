<template>
  <!-- `backgroundRoute` keeps the PREVIOUS page rendered while the
       account-settings modal is open, so the modal genuinely overlays whatever
       the user was doing (vue-router 4 supports <router-view :route>). It is
       undefined on a cold load, in which case the route's own component
       renders normally as the backdrop. -->
  <router-view :route="backgroundRoute" />
  <!-- Task drawer, mounted HERE because app-root is the only component on every
       route. Its trigger lives in the sidebar, which renders only under
       /p/:projectSlug — verified on the running demo 2026-08-18: sidebar
       present on /p/... , ABSENT on /my-projects and /account-settings. Owning
       the panel from the sidebar made the drawer vanish on exactly the pages a
       user passes through between projects.

       This is also why the previous floating tray stack lived here. Same
       reason, same place; only the presentation changed. -->
  <task-drawer />

  <!-- Route-driven ACCOUNT SETTINGS modal. Rendered app-wide so any route can
       be the backdrop; `/account-settings` stays a real route, so deep links,
       bookmarks, back/forward and the existing router.replace() in
       auth-navbar-item all keep working. -->
  <account-settings-modal />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import TaskDrawer from '@/_components/task-tray/task-drawer.vue'
import AccountSettingsModal from '@/user/account-settings-modal.vue'
import { ROUTE_NAMES } from '~/router'

// Register task sources (side-effect imports). MUST stay here rather than in
// the sidebar: registration has to happen at app boot regardless of which
// chrome is mounted, or an in-flight upload would be missing from the drawer
// on any route without a nav.
import '~/tasks/sources/uploads'

const route = useRoute()

/**
 * The route to keep rendering UNDER a modal route.
 *
 * Captured as the last non-modal location. While account-settings is active we
 * hand this to <router-view> so the page the user came from stays mounted;
 * everywhere else it is undefined and routing behaves exactly as before.
 */
const lastNonModalRoute = ref<ReturnType<typeof useRoute> | undefined>(undefined)
const backgroundRoute = ref<ReturnType<typeof useRoute> | undefined>(undefined)

watch(() => route.fullPath, () => {
  if (route.name === ROUTE_NAMES.accountSettings) {
    // Only overlay when we actually have somewhere to overlay ON. On a cold
    // load there is no previous page, so leave it undefined and let the
    // route's own fallback component render.
    backgroundRoute.value = lastNonModalRoute.value
  } else {
    lastNonModalRoute.value = { ...route }
    backgroundRoute.value = undefined
  }
}, { immediate: true })
</script>
