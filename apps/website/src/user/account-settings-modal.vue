<template>
  <!-- ROUTE-DRIVEN modal: open iff the current route IS account-settings.
       Rendered from app-root so whatever page was already on screen stays
       mounted behind it and shows through the scrim.

       WHY ROUTE-DRIVEN rather than a UI-state modal (operator 2026-08-18):
       /account-settings stays a real, guarded route, so deep links, bookmarks,
       browser back/forward and the existing `router.replace({ name:
       accountSettings })` in auth-navbar-item.vue all keep working untouched.
       A pure UI-state modal would have silently broken that replace() call and
       every existing link. -->
  <transition
    enter-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-70 flex items-start justify-center overflow-y-auto bg-pitch/70 py-8 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Account Settings"
      @click.self="close"
    >
      <div class="relative w-full max-w-4xl rounded-xl border border-util-gray-03 bg-echo shadow-2xl">
        <div class="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-util-gray-03 bg-echo px-6 py-4">
          <h2 class="text-xl font-header text-insight">
            Account Settings
          </h2>
          <button
            class="text-cloud/70 hover:text-insight"
            title="Close"
            aria-label="Close account settings"
            @click="close"
          >
            <svg
              viewBox="0 0 16 16"
              class="w-5 h-5 fill-none stroke-current"
              stroke-width="1.8"
            ><path
              d="M4 4l8 8M12 4l-8 8"
              stroke-linecap="round"
            /></svg>
          </button>
        </div>

        <div class="px-2 pb-2">
          <account-settings modal />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ROUTE_NAMES } from '~/router'
import AccountSettings from './account-settings.vue'

const route = useRoute()
const router = useRouter()

const isOpen = computed(() => route.name === ROUTE_NAMES.accountSettings)

/**
 * Closing means LEAVING THE ROUTE, not hiding a panel.
 *
 * Prefer `router.back()` so the modal behaves like the overlay it looks like —
 * the user returns to whatever they were doing. On a COLD LOAD (someone opened
 * or bookmarked /account-settings directly) there is no history entry to go
 * back to and back() would leave the app, so fall back to My Projects: the
 * natural home for an authenticated user with no project context.
 */
const openedFromWithinApp = { value: false }

const close = (): void => {
  if (openedFromWithinApp.value) router.back()
  else void router.replace({ name: ROUTE_NAMES.myProjects })
}

// Esc closes, matching every other dialog in the app.
const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && isOpen.value) close()
}

// Lock body scroll while open so the page behind cannot scroll under the modal.
watch(isOpen, open => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
}, { immediate: true })

onMounted(() => {
  // If the app has navigated at least once before reaching this route, back()
  // is safe. Recorded on the first navigation AWAY from the initial entry.
  const stop = router.afterEach((to, from) => {
    if (from.name !== undefined && to.name === ROUTE_NAMES.accountSettings) {
      openedFromWithinApp.value = true
    }
    if (to.name !== ROUTE_NAMES.accountSettings) {
      openedFromWithinApp.value = false
    }
  })
  onUnmounted(stop)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>
