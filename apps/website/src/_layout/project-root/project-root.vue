<template>
  <project-navbar />
  <sidebar v-if="isProjectMember" />
  <div
    v-if="store.selectedProject"
    :class="isProjectMember ? 'pl-64' : ''"
  >
    <router-view />
  </div>
  <div
    v-else
    class="max-w-screen-2xl mx-auto px-2 py-4 sm:px-6 lg:px-8"
  >
    <invalid-project-component />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { useStore } from '../../_services/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import ProjectNavbar from '../components/project-navbar/project-navbar.vue'
import Sidebar from '../components/side-bar/side-bar.vue'

const store = useStore()

const isProjectMember = computed(() => store.selectedProject?.isMyProject ?? false)
</script>
