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
    class="flex items-center space-x-4 font-medium"
  >
    <router-link
      :to="{ name: ROUTE_NAMES.myProjects }"
      exact-active-class="tab-active"
      class="block tab"
    >
      My Projects
    </router-link>
    <div class="flex">
      <button
        id="user-menu-button"
        type="button"
        class="flex mr-3 text-sm rounded-full md:mr-0 focus:ring-4 dark:focus:ring-frequency/10"
        aria-expanded="false"
        aria-haspopup="true"
        data-dropdown-trigger="hover"
        data-dropdown-toggle="user-dropdown"
        data-dropdown-placement="bottom"
      >
        <span class="sr-only">Open user menu</span>
        <img
          class="h-8 w-8 rounded-full"
          :src="userImage"
        >
      </button>
      <div
        id="user-dropdown"
        class="z-50 my-4 hidden text-base w-36 list-none bg-moss rounded-lg text-insight divide-y divide-gray-100 shadow"
      >
        <ul
          class="py-2 font-medium"
          aria-labelledby="user-menu-button"
          aria-orientation="vertical"
          role="menu"
          tabindex="-1"
        >
          <li
            class="px-4 py-2 rounded-lg hover:(bg-moss cursor-pointer text-frequency)"
            @click="openProfile"
          >
            Profile
          </li>
          <li
            class="px-4 py-2 rounded-lg hover:(bg-moss cursor-pointer text-frequency)"
            @click="logout"
          >
            Sign out
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { initDropdowns } from 'flowbite'
import { computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { authClientKey, storeKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { type BiodiversityStore } from '~/store'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const auth = inject(authClientKey) as Auth0Client
const store = inject(storeKey) as BiodiversityStore
const router = useRouter()

defineProps<{
  domId: string
}>()

const userImage = computed<string>(() => store.user?.picture ?? '') // TODO 156 - Add a default picture

const signup = async (): Promise<void> => {
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.userCompleteProfile } }, screen_hint: 'signup' })
}

const login = async (): Promise<void> => {
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } } })
}

const logout = async (): Promise<void> => {
  // Auth0 logout forces a full refresh (redirect to auth.rfcx.org for SSO purposes)
  await auth.logout({ returnTo: `${ARBIMON_BASE_URL}/logout` })
}

const openProfile = async (): Promise<void> => {
  void router.replace({ name: ROUTE_NAMES.accountSetting })
}

onMounted(() => {
  initDropdowns()
})

</script>
