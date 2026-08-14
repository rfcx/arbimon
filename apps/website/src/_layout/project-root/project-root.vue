<template>
  <!-- The uploader POP-OUT (?popout=1) is chrome-free: no navbar, no sidebar
       (2026-08-14 — restored along with the window, superseding the brief
       tab experiment).

       This is right for a WINDOW and was wrong for a tab. A popup window has no
       navigation by definition, so it cannot be a "dead end" in the way a tab
       can: the user's main tab is still sitting behind it with the full app,
       and this window exists solely to keep uploads visible while they work
       there. Chrome here would be misleading furniture — a sidebar whose links
       would either navigate the little upload window somewhere useless, or
       strand its per-project claim.

       NOTE the uploader page still calls releasePopoutClaim() on unmount. It is
       now hard to reach (a chrome-free window offers no navigation), but it is
       kept deliberately: it is guarded by unsavedCount and it costs nothing,
       while its absence is invisible until a queue mysteriously stalls. -->
  <template v-if="!isPopout">
    <landing-navbar v-if="shouldShowNavbar" />
    <sidebar v-else />
  </template>
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

// chrome-free pop-out mode (uploader)
const isPopout = computed(() => route.query.popout === '1')

</script>
