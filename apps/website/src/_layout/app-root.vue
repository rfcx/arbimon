<template>
  <router-view />
  <!-- Global task-tray stack: one floating collapsible tray per registered
       task source (uploads today; analysis jobs next), stacked vertically.
       Survives route changes — sources are app-wide singletons. -->
  <task-tray-stack />
</template>

<script setup lang="ts">
import TaskTrayStack from '@/_components/task-tray/task-tray-stack.vue'

// Register task sources (side-effect imports).
import '~/tasks/sources/uploads'
</script>
