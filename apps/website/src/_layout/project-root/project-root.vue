<template>
  <landing-navbar v-if="isViewingAsGuest" />
  <sidebar v-else />
  <div
    v-if="store.project"
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
import { useRoute } from 'vue-router'

import { useStore } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import LandingNavbar from '../components/landing-navbar/landing-navbar.vue'
import Sidebar from '../components/side-bar/side-bar.vue'

const store = useStore()
const route = useRoute()

const isViewingAsGuest = computed(() => route.query.guest === '1' || store.userIsExternalGuest)

</script>
