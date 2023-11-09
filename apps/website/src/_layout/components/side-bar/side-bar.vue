<template>
  <aside
    id="sidebar"
    class="fixed z-50 top-16 left-0 w-14 h-screen pt-3 transition-transform -translate-x-full bg-white sm:translate-x-0 dark:bg-echo group transition delay-500 duration-300 ease-in-out hover:(w-64 delay-300)"
    aria-label="Sidebar"
    data-drawer-backdrop="false"
    @mouseenter="showSidebar = true"
    @mouseleave="showSidebar = false; collapse()"
  >
    <div class="h-full pb-4 px-2 overflow-y-auto">
      <ul class="space-y-2 border-gray-200 dark:border-gray-700">
        <li
          v-for="item in items"
          :key="item.title"
        >
          <router-link
            v-if="item.route"
            :to="item.route"
            :title="item.title"
            exact-active-class="bg-gray-100 rounded-lg text-moss"
            class="flex items-center p-2 text-base text-insight hover:(bg-util-gray-02 rounded-lg transition duration-300)"
          >
            <span
              v-if="item.iconRaw === 'fi-grid'"
              class="py-0.5"
            >
              <icon-custom-fi-grid />
            </span>
            <span
              v-if="item.iconRaw === 'pres-chart-bar' === true"
              class="py-0.5"
            >
              <icon-custom-pres-chart-bar />
            </span>
            <span
              v-if="item.iconRaw === 'fi-settings'"
              class="py-0.5"
            >
              <icon-custom-fi-settings />
            </span>
            <span class="ml-2 hidden group-hover:block">{{ item.title }}</span>
          </router-link>
          <a
            v-else-if="item.legacyPath"
            :href="arbimonLink + item.legacyPath"
            class="flex items-center p-2 text-base text-insight ease-in-out hover:(bg-util-gray-02 rounded-lg transition duration-300) active:(bg-gray-100 rounded-lg text-moss)"
          >
            <span class="ml-2 hidden group-hover:block">{{ item.title }}</span>
            <icon-custom-linkout
              v-if="item.legacyPath"
              class="text-xs ml-1"
            />
          </a>
          <button
            v-else
            type="button"
            class="mainmenu flex items-center p-2 w-full text-base font-normal text-insight hover:(bg-util-gray-02 rounded-lg transition duration-300)"
            :aria-controls="itemId(item.title)"
            :data-collapse-toggle="itemId(item.title)"
          >
            <span
              v-if="item.iconRaw === 'cloud-upload'"
              class="py-0.5"
            >
              <icon-custom-cloud-upload />
            </span>
            <span
              v-if="item.iconRaw === 'fa-search'"
              class="py-0.5"
            >
              <icon-fa-search class="h-5 w-5" />
            </span>
            <span
              v-if="item.iconRaw === 'fi-aed'"
              class="py-0.5"
            >
              <icon-custom-fi-activity class="h-6 w-6" />
            </span>
            <span class="flex-1 ml-2 text-left whitespace-nowrap hidden group-hover:block">
              {{ item.title }}
            </span>
            <svg
              aria-hidden="true"
              class="w-6 h-6 hidden group-hover:block"
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
            class="submenu py-2 space-y-2 hidden"
            :class="{ 'block': isParent(item) }"
          >
            <li
              v-for="childItem in item.children"
              :key="childItem.title"
            >
              <router-link
                v-if="childItem.route"
                :to="childItem.route"
                exact-active-class="bg-gray-100 rounded-lg text-moss"
                class="flex items-center p-2 pl-12 w-full text-base font-normal text-insight hover:(bg-util-gray-02 rounded-lg transition duration-300)"
              >
                {{ childItem.title }}
              </router-link>
              <a
                v-else-if="childItem.legacyPath"
                :href="arbimonLink + childItem.legacyPath"
                class="flex items-center p-2 pl-12 w-full text-base font-normal text-insight hover:(bg-util-gray-02 rounded-lg transition duration-300) active:(bg-gray-100 rounded-lg text-moss)"
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
          <router-link
            :to="{ name: ROUTE_NAMES.myProjects }"
            class="flex items-center p-2 text-base font-normal text-insight hover:(bg-util-gray-02 rounded-lg transition duration-300) active:(bg-gray-100 rounded-lg text-moss)"
          >
            <span
              class="py-0.5"
            >
              <icon-custom-fi-clipboard />
            </span>
            <span class="ml-2 hidden group-hover:block">My Projects</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { initCollapses, initDrawers, initDropdowns } from 'flowbite'
import { computed, onMounted, ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import { isDefined } from '@rfcx-bio/utils/predicates'

import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'

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
    title: 'Audio Analyses',
    iconRaw: 'fi-aed',
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
        legacyPath: '/analysis/random-forest-models/models'
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
    title: 'Ecological Insights',
    iconRaw: 'pres-chart-bar',
    route: {
      name: ROUTE_NAMES.overview
    }
  },
  {
    title: 'Project Settings',
    iconRaw: 'fi-settings',
    route: {
      name: ROUTE_NAMES.projectSettings
    }
  }
]

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
