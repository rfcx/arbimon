<template>
  <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
    <li v-if="toggles?.explore">
      <router-link
        :to="{ name: ROUTE_NAMES.explore }"
        exact-active-class="tab-active"
        class="block tab relative"
      >
        Projects
      </router-link>
    </li>

    <li v-if="store.user">
      <router-link
        :to="{ name: ROUTE_NAMES.myProjects }"
        exact-active-class="text-gray-900 dark:text-insight tab-active"
        class="block tab relative"
      >
        My Projects
      </router-link>
    </li>
    <li>
      <router-link
        :to="{ name: ROUTE_NAMES.landingHowItWorks }"
        exact-active-class="tab-active"
        class="block tab relative"
      >
        How it works
      </router-link>
    </li>
    <li>
      <button
        :id="`${domId}DropdownResourcesButton`"
        type="button"
        :data-dropdown-toggle="`${domId}DropdownResources`"
        data-dropdown-trigger="hover"
        class="flex items-center justify-between w-full py-2 pl-3 pr-4 font-medium text-gray-700 md:m-2 md:p-0 md:w-auto lg:m-0 dark:text-insight dark:hover:text-frequency"
      >
        About <svg
          class="w-4 h-4 ml-1"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        /></svg>
      </button>
      <div
        :id="`${domId}DropdownResources`"
        class="z-60 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-moss dark:divide-moss border-0"
      >
        <ul
          :aria-labelledby="`${domId}DropdownResourcesButton`"
          class="py-2 text-gray-700 dark:text-insight"
        >
          <li>
            <router-link
              :to="{ name: ROUTE_NAMES.landingTeam }"
              exact-active-class="!text-gray-900 !dark:text-insight"
              class="block px-4 py-2 dark:text-insight dark:hover:text-frequency"
            >
              Mission
            </router-link>
          </li>
          <li>
            <router-link
              :to="{ name: ROUTE_NAMES.landingPublications }"
              exact-active-class="!text-gray-900 !dark:text-insight"
              class="block px-4 py-2 dark:text-insight dark:hover:text-frequency"
            >
              Publications
            </router-link>
          </li>
          <li class="pb-2">
            <router-link
              :to="{ name: ROUTE_NAMES.landingFAQ }"
              exact-active-class="!text-gray-900 !dark:text-insight"
              class="block px-4 py-2 dark:text-insight dark:hover:text-frequency"
            >
              FAQ
            </router-link>
          </li>
          <li class="pt-2 border-t-1 border-util-gray-02">
            <a
              href="https://rfcx.org/press"
              class="block px-4 py-2 text-gray-700 dark:text-insight dark:hover:text-frequency"
            >Press <icon-custom-linkout class="inline ml-1" /></a>
          </li>
          <li class="pb-2 border-b-1 border-util-gray-02">
            <a
              href="https://rfcx.org/blog"
              class="block px-4 py-2 text-gray-700 dark:text-insight dark:hover:text-frequency"
            >Blog <icon-custom-linkout class="inline ml-1" /></a>
          </li>
          <li class="pt-2">
            <a
              href="https://help.arbimon.org/"
              class="block px-4 py-2 text-gray-700 dark:text-insight dark:hover:text-frequency"
            >Help &amp; support <icon-custom-linkout class="inline ml-1" /></a>
          </li>
          <li>
            <router-link
              :to="{ name: ROUTE_NAMES.landingContact }"
              exact-active-class="!text-gray-900 !dark:text-insight"
              class="block px-4 py-2 text-gray-700 dark:text-insight dark:hover:text-frequency"
            >
              Contact us
            </router-link>
          </li>
        </ul>
      </div>
    </li>
    <li>
      <div
        v-if="!store.user"
      >
        <button
          class="lg:hidden block font-medium px-3 py-2 dark:text-insight dark:hover:text-frequency !text-gray-900 !dark:text-insight"
          @click="login"
        >
          Log in / sign up
        </button>
      </div>

      <div v-else>
        <button
          class="lg:hidden block font-medium px-3 py-2 dark:text-insight dark:hover:text-frequency !text-gray-900 !dark:text-insight"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { initDropdowns } from 'flowbite'
import { inject, onMounted } from 'vue'

import { authClientKey, togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const store = useStore()
const auth = inject(authClientKey) as Auth0Client

defineProps<{
  domId: string
}>()

const toggles = inject(togglesKey)

onMounted(() => {
  initDropdowns()
})

const login = async (): Promise<void> => {
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, prompt: 'login' })
}

const logout = async (): Promise<void> => {
  await auth.logout({ returnTo: window.location.origin })
}

</script>
