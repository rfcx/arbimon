<template>
  <fixed-navbar />
  <sidebar />
  <div
    v-if="store.selectedProject"
    class="w-full pt-20 pl-72 pr-8 pb-6"
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
import { useStore } from '../../_services/store'
import FixedNavbar from '../components/fixed-navbar/fixed-navbar.vue'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import Sidebar from '../components/side-bar/side-bar.vue'

const store = useStore()
</script>
