<template>
  <!-- Vertical stack of independent task trays. Each collapses on its own;
       hidden entirely when no source is visible.

       TWO LAYOUTS (operator 2026-08-18):
       - DOCKED: normal flow inside the app-wide task drawer, newest source
         LAST so it reads top-down like any other panel.
       - FLOATING (legacy): fixed bottom-right, column-reverse so the newest
         source sits on top. Retained because the component is generic and a
         floating usage may return (e.g. a chrome-free full-screen view). -->
  <div
    v-if="visibleSources.length > 0"
    :class="docked
      ? 'flex flex-col gap-y-3 items-stretch'
      : 'fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-y-3 items-end'"
  >
    <task-tray
      v-for="source in visibleSources"
      :key="source.id"
      :source="source"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

import { storeKey } from '@/globals'
import { hasFeatureAccess } from '~/access/entitlements'
import { taskSources } from '~/tasks/task-center'
import TaskTray from './task-tray.vue'

withDefaults(defineProps<{
  /** Render in normal flow (the task drawer) instead of floating. */
  docked?: boolean
}>(), { docked: false })

// Resolve the store via inject (runtime) rather than a static `~/store`
// import: this component sits in the app-root render chain, and a static
// store import there creates an SSR module-init cycle (vite-ssg build).
const store = inject(storeKey)

// A source shows when it's visible AND (ungated OR the user is entitled).
// Feature gating is enforced here centrally, so no source re-implements it.
const visibleSources = computed(() => taskSources.filter(source =>
  source.visible.value &&
  (source.requiresFeature === undefined || hasFeatureAccess(source.requiresFeature, store?.user?.email))
))
</script>
