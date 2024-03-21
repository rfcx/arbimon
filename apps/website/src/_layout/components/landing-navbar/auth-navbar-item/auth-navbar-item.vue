<template>
  <div
    v-if="!store.user"
    class="flex items-center"
  >
    <button
      class="text-gray-800 font-display dark:text-insight px-4 lg:px-5 py-1.5 lg:py-2 mr-2 dark:hover:text-frequency md:block"
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
  <div v-else>
    <div
      v-if="isLoading"
      class="flex items-center space-x-4 font-medium animate-pulse"
    >
      <div
        role="status"
        class="flex items-center space-x-4 font-medium animate-pulse"
      >
        <div class="flex max-w-sm items-center space-x-4 font-medium">
          <div class="tab bg-steel-gray relative block h-5 w-24 rounded-full dark:bg-steel-gray-500" />
          <div class="flex">
            <div class="dark:focus:ring-frequency/10 mr-3 flex rounded-full text-sm focus:ring-4 md:mr-0">
              <div class="bg-steel-gray h-8 w-8 rounded-full dark:bg-steel-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex items-center space-x-4 font-medium"
    >
      <router-link
        :to="{ name: ROUTE_NAMES.myProjects }"
        exact-active-class="tab-active"
        class="block tab relative"
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
          class="z-50 my-4 hidden text-base w-50 list-none bg-moss rounded-lg text-insight divide-y divide-gray-100 shadow"
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
              Account settings
            </li>
            <li
              class="px-4 py-2 rounded-lg hover:(bg-moss cursor-pointer text-frequency)"
              @click="logout"
            >
              Log out
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { initDropdowns } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'
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
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, screen_hint: 'signup' })
}

const login = async (): Promise<void> => {
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, prompt: 'login' })
}

const logout = async (): Promise<void> => {
  // Auth0 logout forces a full refresh (redirect to auth.rfcx.org for SSO purposes)
  await auth.logout({ returnTo: `${ARBIMON_BASE_URL}/legacy-logout` })
}

const openProfile = async (): Promise<void> => {
  void router.replace({ name: ROUTE_NAMES.accountSettings })
}

const isLoading = ref(true)

onMounted(() => {
  auth.isAuthenticated().then((authenticated) => {
    isLoading.value = !authenticated
    if (authenticated) {
      initDropdowns()
    }
  })
})

</script>
