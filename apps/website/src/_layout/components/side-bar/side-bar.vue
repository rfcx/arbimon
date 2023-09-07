<template>
  <aside
    id="sidebar"
    class="fixed top-0 left-0 w-64 h-screen pt-3 transition-transform -translate-x-full bg-white sm:translate-x-0 dark:bg-steel-gray"
    aria-label="Sidebar"
  >
    <div class="h-full px-3 pb-4 overflow-y-auto">
      <div
        class="flex pb-3"
      >
        <router-link
          :to="{ name: ROUTE_NAMES.landingHome }"
          class="flex items-center min-w-58"
        >
          <brand-logo />
        </router-link>
      </div>
      <div class="pt-5 border-t border-gray-200 dark:border-gray-700">
        <version-control />
        <router-link
          :to="{ name: ROUTE_NAMES.overview}"
          class="px-3 py-2 text-xs font-bold rounded-lg bg-gray-500"
        >
          Preview
        </router-link>
      </div>
      <ul class="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
        <li
          v-for="item in items"
          :key="item.title"
        >
          <router-link
            v-if="item.route"
            :to="item.route"
            exact-active-class="!text-gray-900 !dark:text-white"
            class="flex items-center p-2 text-base font-normal text-gray-700 rounded-lg transition duration-75 group dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <!-- eslint-disable vue/no-v-html -->
            <span
              v-if="item.iconRaw"
              v-html="item.iconRaw"
            />
            <!--eslint-enable-->
            <span class="ml-3">{{ item.title }}</span>
          </router-link>
          <a
            v-else-if="item.legacyPath"
            :href="arbimonLink + item.legacyPath"
            class="flex items-center p-2 text-base font-normal text-gray-700 rounded-lg transition duration-75 group dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <!-- eslint-disable vue/no-v-html -->
            <span
              v-if="item.iconRaw"
              v-html="item.iconRaw"
            />
            <!--eslint-enable-->
            <span class="ml-3">{{ item.title }}</span>
            <icon-custom-linkout
              v-if="item.legacyPath"
              class="text-xs ml-1"
            />
          </a>
          <button
            v-else
            type="button"
            class="flex items-center p-2 w-full text-base font-normal text-gray-700 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            :aria-controls="itemId(item.title)"
            :data-collapse-toggle="itemId(item.title)"
          >
            <!-- eslint-disable vue/no-v-html -->
            <span
              v-if="item.iconRaw"
              v-html="item.iconRaw"
            />
            <!--eslint-enable-->
            <span class="flex-1 ml-3 text-left whitespace-nowrap">{{ item.title }}</span>
            <svg
              aria-hidden="true"
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg>
          </button>
          <ul
            v-if="item.children"
            :id="itemId(item.title)"
            class="py-2 space-y-2"
            :class="{ hidden: !isParent(item) && items.length > 4 }"
          >
            <li
              v-for="childItem in item.children"
              :key="childItem.title"
            >
              <router-link
                v-if="childItem.route"
                :to="childItem.route"
                exact-active-class="!text-gray-900 !dark:text-white"
                class="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-700 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                {{ childItem.title }}
              </router-link>
              <a
                v-else-if="childItem.legacyPath"
                :href="arbimonLink + childItem.legacyPath"
                class="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-700 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                {{ childItem.title }}
                <icon-custom-linkout
                  v-if="item.legacyPath"
                  class="text-xs ml-1"
                />
              </a>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
        <li>
          <a
            href="#"
            class="flex items-center p-2 text-base font-normal text-gray-700 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white group"
          >
            <svg
              aria-hidden="true"
              class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
              clip-rule="evenodd"
            /></svg>
            <span class="ml-3">Help</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { initCollapses, initDrawers, initDropdowns } from 'flowbite'
import { computed, onMounted } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import BrandLogo from '../brand-logo.vue'
import VersionControl from '../landing-navbar/auth-navbar-item/version-control.vue'

const store = useStore()

// TODO: pass the link / nav menus in as props
const arbimonLink = computed(() => {
  const selectedProjectSlug = store.selectedProject?.slug
  if (selectedProjectSlug === undefined) return ''
  else return `${import.meta.env.VITE_ARBIMON_BASE_URL}/project/${selectedProjectSlug}`
})

type Item = { title: string, iconRaw?: string, public?: boolean, route?: RouteLocationRaw, legacyPath?: string, children?: Item[] }

const items = computed(() => {
  // TODO Correctly identify my projects
  return (store.selectedProject?.slug === 'puerto-rico-island-wide' || (store.selectedProject?.isMyProject ?? false)) ? allItems : allItems.filter(i => i.public)
})

const allItems: Item[] = [
  {
    title: 'Dashboard',
    iconRaw: '<svg aria-hidden="true" class="w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>',
    public: true,
    route: {
      name: ROUTE_NAMES.dashboard
    }
  },
  {
    title: 'Import',
    iconRaw: '<svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" /><path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" /></svg>',
    children: [
      {
        title: 'Sites',
        legacyPath: '/audiodata/sites'
      },
      {
        title: 'Recordings',
        legacyPath: '/audiodata/uploads'
      }
    ]
  },
  {
    title: 'Explore',
    iconRaw: '<svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>',
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
    title: 'Acoustic Analyses',
    iconRaw: '<svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>',
    children: [
      {
        title: 'Active Jobs',
        legacyPath: '/jobs'
      },
      {
        title: 'Pattern Matching',
        legacyPath: '/analysis/patternmatching'
      },
      {
        title: 'Random Forest Models',
        legacyPath: '/analysis/random-forest-models'
      },
      {
        title: 'Soundscape Analysis',
        legacyPath: '/analysis/soundscapes'
      },
      {
        title: 'CNN',
        route: {
          name: ROUTE_NAMES.cnnJobList
        }
      }
    ]
  },
  {
    title: 'Insights',
    iconRaw: '<svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>',
    route: {
      name: ROUTE_NAMES.overview
    }
  },
  {
    title: 'Project Settings',
    iconRaw: '<svg aria-hidden="true" class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>',
    legacyPath: '/settings'
  }
]

function itemId (title: string): string {
  return 'sidebar-' + title.toLowerCase().replace(' ', '-')
}

const route = useRoute()

function isParent (item: Item): boolean {
  const childRouteNames = (item.children ?? []).map(i => {
    return i.route !== undefined && typeof i.route !== 'string' && 'name' in i.route ? i.route?.name : undefined
  }).filter(isDefined)
  return route.matched.some(r => childRouteNames.includes(r.name ?? ''))
}

onMounted(() => {
  initDrawers()
  initDropdowns()
  initCollapses()
})
</script>
