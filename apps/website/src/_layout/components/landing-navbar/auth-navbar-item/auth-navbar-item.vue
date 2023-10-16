<template>
  <div
    v-if="!store.user"
    class="flex items-center"
  >
    <button
      class="text-gray-800 font-display dark:text-insight px-4 lg:px-5 py-1.5 lg:py-2 mr-2 dark:hover:text-frequency hidden md:block"
      @click="login"
    >
      Log in
    </button>
    <button
      class="btn btn-primary"
      @click="signup"
    >
      Sign up
    </button>
  </div>
  <div
    v-else
    class="flex items-center"
  >
    <router-link
      :to="{ name: ROUTE_NAMES.myProjects }"
      class="mr-2 md:mr-4 font-medium text-gray-700 dark:text-insight py-2 pr-4 pl-3 md:p-0"
    >
      My Projects
    </router-link>
    <div
      :id="domId"
      type="button"
      class="hover:cursor-pointer focus:cursor-pointer group"
      aria-expanded="true"
      aria-haspopup="true"
    >
      <img
        class="h-8 w-8 rounded-full"
        :src="userImage"
      >
      <ul
        :aria-labelledby="domId"
        aria-orientation="vertical"
        class="logout-dropdown absolute top-13 right-1 z-50 min-w-40 bg-moss rounded-lg text-insight hover:text-frequency invisible group-hover:visible focus:outline-none transition-all"
        role="menu"
        tabindex="-1"
      >
        <li
          class="p-4 rounded-lg hover:(bg-moss cursor-pointer)"
          @click="logout"
        >
          Sign out
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { computed, inject } from 'vue'

import { authClientKey, storeKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { type BiodiversityStore } from '~/store'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_BASE_URL

const auth = inject(authClientKey) as Auth0Client
const store = inject(storeKey) as BiodiversityStore

defineProps<{
  domId: string
}>()

const userImage = computed<string>(() => store.user?.picture ?? '') // TODO 156 - Add a default picture

const signup = async (): Promise<void> => {
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.userCompleteRegistration } }, screen_hint: 'signup' })
}

const login = async (): Promise<void> => {
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } } })
}

const logout = async (): Promise<void> => {
  // Auth0 logout forces a full refresh (redirect to auth.rfcx.org for SSO purposes)
  await auth.logout({ returnTo: `${ARBIMON_BASE_URL}/logout` })
}

</script>
