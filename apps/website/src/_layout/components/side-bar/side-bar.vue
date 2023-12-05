<template>
  <aside
    id="sidebar"
    class="fixed z-50 top-0 left-0 w-13 border-r-1 border-util-gray-02 hover:border-insight h-screen transition-transform -translate-x-full bg-white sm:translate-x-0 dark:bg-echo group transition duration-300 ease-in-out delay-500 hover:(w-66 delay-300)"
    aria-label="Sidebar"
    data-drawer-backdrop="false"
    @mouseenter="showSidebar = true"
    @mouseleave="showSidebar = false; collapse()"
  >
    <div class="h-full pb-4 overflow-y-auto">
      <div class="flex flex-col h-full justify-between">
        <div>
          <div class="pl-3 pr-2 my-4 h-8 flex flex-row items-center">
            <router-link
              :to="{ name: ROUTE_NAMES.landingHome }"
              class="flex items-center"
            >
              <img
                src="/src/_services/assets/arbimon-logo.svg"
                class="h-7 max-h-7"
                alt="Arbimon Logo"
              >
              <span
                v-if="showSidebar"
                class="ml-4 uppercase whitespace-nowrap text-lg font-display dark:text-insight"
              >Arbimon</span>
            </router-link>
          </div>
          <div class="my-4 border-t-1 border-util-gray-02" />
          <ul class="px-3 flex flex-col gap-y-4 border-gray-200 dark:border-gray-700">
            <li
              v-for="item in items"
              :key="item.title"
            >
              <router-link
                v-show="item?.visibleCondition == null || item.visibleCondition() === true"
                v-if="item.route"
                :to="item.route"
                :title="item.title"
                exact-active-class="bg-insight rounded text-moss"
                class="flex items-center text-base hover:(bg-util-gray-02 rounded transition duration-300)"
              >
                <span
                  v-if="item.iconRaw === 'fi-grid'"
                  class="p-0.5"
                >
                  <icon-custom-fi-grid />
                </span>
                <span
                  v-if="item.iconRaw === 'pres-chart-bar' === true"
                  class="p-0.5"
                >
                  <icon-custom-pres-chart-bar />
                </span>
                <span
                  v-if="item.iconRaw === 'fi-settings'"
                  class="p-0.5"
                >
                  <icon-custom-fi-settings />
                </span>
                <span class="ml-2 hidden group-hover:block">{{ item.title }}</span>
              </router-link>
              <a
                v-else-if="item.legacyPath"
                :href="arbimonLink + item.legacyPath"
                class="flex items-center text-base ease-in-out active:text-moss hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              >
                <span class="ml-2 hidden group-hover:block">{{ item.title }}</span>
              </a>
              <button
                v-else
                type="button"
                class="mainmenu flex items-center w-full text-base font-normal active:text-moss hover:(bg-util-gray-02 rounded transition duration-300)"
                :aria-controls="itemId(item.title)"
                :data-collapse-toggle="itemId(item.title)"
              >
                <span
                  v-if="item.iconRaw === 'cloud-upload'"
                  class="p-0.5"
                >
                  <icon-custom-cloud-upload />
                </span>
                <span
                  v-if="item.iconRaw === 'fa-search'"
                  class="p-0.5"
                >
                  <icon-fa-search class="h-5 w-5" />
                </span>
                <span
                  v-if="item.iconRaw === 'fi-aed'"
                  class="p-0.5"
                >
                  <icon-custom-fi-activity class="h-6 w-6" />
                </span>
                <span class="flex-1 ml-2 text-left whitespace-nowrap hidden group-hover:block">
                  {{ item.title }}
                </span>
                <span
                  v-if="showSidebar"
                  class="p-0.5"
                >
                  <icon-fa-chevron-down class="w-3 h-3 fa-chevron-down" />
                  <icon-fa-chevron-up class="w-3 h-3 fa-chevron-up hidden" />
                </span>
              </button>
              <ul
                v-if="item.children"
                :id="itemId(item.title)"
                class="submenu hidden"
                :class="{ 'block': isParent(item) }"
              >
                <li
                  v-for="childItem in item.children"
                  :key="childItem.title"
                  class="mt-4"
                >
                  <router-link
                    v-show="childItem.visibleCondition == null || childItem.visibleCondition() === true"
                    v-if="childItem.route"
                    :to="childItem.route"
                    exact-active-class="bg-insight rounded text-moss"
                    class="flex items-center pl-12 w-full text-base font-normal hover:(bg-util-gray-02 rounded transition duration-300)"
                  >
                    {{ childItem.title }}
                  </router-link>
                  <a
                    v-else-if="childItem.legacyPath"
                    :href="arbimonLink + childItem.legacyPath"
                    class="flex items-center pl-12 w-full text-base font-normal hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
                  >
                    {{ childItem.title }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <div class="my-4 border-t-1 border-util-gray-02" />
          <ul class="px-3 flex flex-col gap-y-4">
            <li>
              <a
                :title="'Arbimon Support'"
                :href="supportLink"
                exact-active-class="bg-insight rounded text-moss"
                class="flex items-center text-base font-normal active:text-moss hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              >
                <icon-custom-fi-help />
                <span class="ml-2 hidden group-hover:block">Help</span>
              </a>
            </li>
            <li>
              <router-link
                :to="{ name: ROUTE_NAMES.myProjects }"
                exact-active-class="bg-insight rounded text-moss"
                class="flex items-center text-base font-normal active:text-moss hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              >
                <span
                  class="p-0.5"
                >
                  <icon-custom-fi-clipboard />
                </span>
                <span class="ml-2 hidden group-hover:block">My projects</span>
              </router-link>
            </li>
          </ul>
        </div>
        <div>
          <div class="my-4 border-t-1 border-util-gray-02" />
          <ul class="px-3 flex flex-col gap-y-4">
            <li>
              <router-link
                :to="{ name: ROUTE_NAMES.accountSetting }"
                exact-active-class="bg-insight rounded text-moss"
                class="flex items-center text-base font-normal active:text-moss hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              >
                <span
                  class="p-0.5"
                >
                  <icon-custom-fi-user />
                </span>
                <span class="ml-2 hidden group-hover:block">Account settings</span>
              </router-link>
            </li>
            <li
              class="my-2 flex items-center cursor-pointer text-base font-normal active:text-moss hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
              @click="logout"
            >
              <span class="p-0.5">
                <icon-custom-fi-log-out />
              </span>
              <span class="ml-2 hidden group-hover:block">Sign Out</span>
            </li>
          </ul>
          <div class="my-4 border-t-1 border-util-gray-02" />
          <ul class="px-2.5 flex flex-col gap-y-4">
            <li
              class="my-2 flex items-center text-base font-normal h-10 hover:(bg-util-gray-02 rounded transition duration-300) active:(bg-insight rounded text-moss)"
            >
              <img
                class="h-8 w-8 self-center rounded-full"
                :src="userImage"
              >
              <div class="ml-2 flex flex-row align-top hidden group-hover:block">
                <span class="block">{{ userName }}</span>
                <span class="text-sm text-util-gray-01">{{ userEmail }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { initCollapses, initDrawers, initDropdowns } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { authClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL
const supportLink = ref('https://support.rfcx.org/')

const auth = inject(authClientKey) as Auth0Client
const store = useStore()

// TODO: pass the link / nav menus in as props
const arbimonLink = computed(() => {
  const selectedProjectSlug = store.selectedProject?.slug
  if (selectedProjectSlug === undefined) return ''
  else return `${import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL}/project/${selectedProjectSlug}`
})

const userImage = computed<string>(() => store.user?.picture ?? '')
const userEmail = computed<string>(() => store.user?.email ?? '')
const userName = computed<string>(() => store.user?.given_name + ' ' + store.user?.family_name ?? '')

type Item = { title: string, iconRaw?: string, public?: boolean, visibleCondition?: () => boolean, route?: RouteLocationRaw, legacyPath?: string, children?: Item[] }

const items = computed(() => {
  // TODO Correctly identify my projects
  return (store.selectedProject?.slug === 'puerto-rico-island-wide' || (store.selectedProject?.isMyProject ?? false)) ? allItems : allItems.filter(i => i.public)
})

const allItems: Item[] = [
  {
    title: 'Overview',
    iconRaw: 'fi-grid',
    public: true,
    route: {
      name: ROUTE_NAMES.dashboard
    }
  },
  {
    title: 'Import',
    iconRaw: 'cloud-upload',
    children: [
      {
        title: 'Sites',
        legacyPath: '/audiodata/sites'
      },
      {
        title: 'Recordings',
        legacyPath: '/audiodata/recordings'
      }
    ]
  },
  {
    title: 'Explore',
    iconRaw: 'fa-search',
    children: [
      {
        title: 'Visualizer',
        legacyPath: '/visualizer'
      },
      {
        title: 'Sites',
        legacyPath: '/audiodata/sites'
      },
      {
        title: 'Recordings',
        legacyPath: '/audiodata/recordings'
      },
      {
        title: 'Species',
        legacyPath: '/audiodata/species'
      },
      {
        title: 'Playlists',
        legacyPath: '/audiodata/playlists'
      }
    ]
  },
  {
    title: 'Audio analyses',
    iconRaw: 'fi-aed',
    children: [
      {
        title: 'Active jobs',
        legacyPath: '/jobs'
      },
      {
        title: 'Pattern Matching',
        legacyPath: '/analysis/patternmatching'
      },
      {
        title: 'Random Forest Models',
        legacyPath: '/analysis/random-forest-models/models'
      },
      {
        title: 'Soundscape Analysis',
        legacyPath: '/analysis/soundscapes'
      },
      {
        title: 'CNN',
        visibleCondition: () => {
          return userEmail.value.includes('rfcx.org')
        },
        route: {
          name: ROUTE_NAMES.cnnJobList
        }
      }
    ]
  },
  {
    title: 'Ecological insights',
    iconRaw: 'pres-chart-bar',
    route: {
      name: ROUTE_NAMES.overview
    }
  },
  {
    title: 'Project settings',
    iconRaw: 'fi-settings',
    route: {
      name: ROUTE_NAMES.projectSettings
    }
  }
]

const logout = async (): Promise<void> => {
  // Auth0 logout forces a full refresh (redirect to auth.rfcx.org for SSO purposes)
  await auth.logout({ returnTo: `${ARBIMON_BASE_URL}/logout` })
}

function itemId (title: string): string {
  return 'sidebar-' + title.toLowerCase().replace(' ', '-')
}

const route = useRoute()

const showSidebar = ref(false)
let submenuEl, mainmenuEl: NodeListOf<Element> | null

function isParent (item: Item): boolean {
  const childRouteNames = (item.children ?? []).map(i => {
    return i.route !== undefined && typeof i.route !== 'string' && 'name' in i.route ? i.route?.name : undefined
  }).filter(isDefined)
  return route.matched.some(r => childRouteNames.includes(r.name ?? ''))
}

function collapse (): void {
  submenuEl = document.querySelectorAll('.submenu')
  mainmenuEl = document.querySelectorAll('.mainmenu')
  if (showSidebar.value === false) {
    submenuEl?.forEach((el: Element) => el?.classList.add('hidden'))
    mainmenuEl?.forEach((el: Element) => el?.setAttribute('aria-expanded', 'false'))
  }
}

onMounted(() => {
  initDrawers()
  initDropdowns()
  initCollapses()
})
</script>
<style lang="scss">
button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-down {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-down {
  display: inline-block;
}
</style>
