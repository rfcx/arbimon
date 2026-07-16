<template>
  <!-- Vertical stack of independent task trays (bottom-right, newest source
       on top). Each tray collapses on its own; hidden entirely when no
       source is visible. -->
  <div
    v-if="visibleSources.length > 0"
    class="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-y-3 items-end"
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
