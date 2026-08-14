<template>
  <!-- The uploader tab (?popout=1) keeps the SIDEBAR (2026-08-14).

       It used to be fully chrome-free, which was right when it was a
       chromeless POPUP WINDOW: that window existed solely to keep uploads
       running while the user worked in the original tab, and a popup has no
       navigation by definition.

       As a TAB that reasoning inverts. A tab looks and behaves like any other
       page in the app, so a user WILL treat it as one — and a tab with no
       navigation whatsoever is a dead end: no way to reach the project, the
       site list, or anything else without editing the URL or hunting for the
       original tab (which may itself have been closed). Keeping the sidebar
       costs nothing while uploads run in the background — they are driven by
       the upload singleton, not by this page's presence — and navigating away
       now releases the tab's claim cleanly (see releasePopoutClaim). -->
  <landing-navbar v-if="shouldShowNavbar" />
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

// view as guest, or does not have a permission to view the project
const shouldShowNavbar = computed(() => route.query.guest === '1' || store.userIsExternalGuest || store.project === undefined)

</script>
