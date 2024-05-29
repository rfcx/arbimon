<template>
  <div class="flex items-center justify-center min-h-screen">
    <icon-custom-ic-loading class="mb-4 h-8 animate-spin" />
  </div>
</template>
<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { authClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'

const auth = inject(authClientKey) as Auth0Client
const router = useRouter()

onMounted(() => {
  const name = router.currentRoute.value.name
  if (name === 'signup') {
    auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, screen_hint: 'signup' })
  } else {
    auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, screen_hint: 'login' })
  }
})
</script>
