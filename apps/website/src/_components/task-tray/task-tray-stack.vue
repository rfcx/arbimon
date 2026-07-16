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
import { computed } from 'vue'

import { taskSources } from '~/tasks/task-center'
import TaskTray from './task-tray.vue'

const visibleSources = computed(() => taskSources.filter(source => source.visible.value))
</script>
