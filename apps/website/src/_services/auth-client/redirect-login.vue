<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { inject, onMounted } from 'vue'

import { authClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'

const auth = inject(authClientKey) as Auth0Client

onMounted(() => {
  auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, prompt: 'login' })
})
</script>
