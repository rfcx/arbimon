<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      v-if="!hideProjectList"
      :data="projectResults"
      :selected-project-id="selectedProjectId ?? undefined"
      :selected-tab="selectedTab"
      :initial-search="searchInputFromQuery"
      :is-loading="isLoading"
      :no-results="noResults"
      :is-error="isErrorLoadedProject"
      class="absolute z-40 h-100vh"
      @emit-selected-project="onEmitSelectedProject"
      @emit-search="onEmitSearch"
      @emit-load-more="onEmitLoadMore"
      @emit-load-published-projects="onEmitLoadPublishedProjects"
      @emit-swap-tab="onEmitSwapTab"
    />
    <project-info
      v-if="selectedProjectId !== null && !hideProjectList"
      class="absolute z-50 mt-10"
      :project-id="selectedProjectId"
      @emit-close-project-info="selectedProjectId = null"
    />
    <div
      class="flex flex-col inset-1/2 w-3vh absolute z-40 h-7vh bg-moss transition-transform -translate-x-full rounded-r-lg "
      :class="leftMargin"
      @click="toggleProjectList"
    >
      <icon-fas-chevron-right
        v-if="hideProjectList"
        class="w-3 h-3 m-auto"
      />
      <icon-fas-chevron-left
        v-else
        class="w-3 h-3 m-auto"
      />
    </div>
    <map-view
      :data="projectResults"
      class="relative left-0 z-30 w-full h-100vh"
      :selected-project-id="selectedProjectId ?? undefined"
      :is-error="isErrorLoadedProject"
      @emit-selected-project="onEmitSelectedProject"
    />
    <chat-view />
  </section>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import debounce from 'lodash.debounce'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { apiBioGetProjectsGeo } from '@rfcx-bio/common/api-bio/project/projects'
import { type ProjectLight, type ProjectProfileWithMetrics } from '@rfcx-bio/common/api-bio/project/projects'
import type { SearchResponseProject } from '@rfcx-bio/common/api-bio/search/search'
import { apiBioSearch } from '@rfcx-bio/common/api-bio/search/search'

import ChatView from '@/_components/arbi-assistant/chat-view.vue'
import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useProjectDirectoryStore, useStore } from '~/store'
import MapView from './blocks/map-view.vue'
import ProjectInfo from './blocks/project-info.vue'
import ProjectList from './blocks/projects-list.vue'
import type { Tab } from './data/types'

const router = useRouter()
const route = useRoute()
const store = useStore()
const pdStore = useProjectDirectoryStore()
const selectedProjectId = ref<number | null>(null)
const hideProjectList = ref<boolean>(false)

const apiClientBio = inject(apiClientKey) as AxiosInstance

const selectedTab = ref<Tab>('All')
const searchInputFromQuery = ref<string>('')

const isLoading = ref(false)
const isErrorLoadedProject = ref(false)
/** List of projects (with profile) you got from search results, initial is the first 20 in the list -- to show in the list */
const projectResults = ref<ProjectLight[]>(pdStore.allProjects)

const myProjects = computed(() => {
  const myProjectIds = store.myProjects.map(p => p.id)
  return pdStore.allProjects.filter(p => myProjectIds.includes(p.id))
})

const onEmitSelectedProject = (locationProjectId: number) => {
  selectedProjectId.value = locationProjectId
  hideProjectList.value = false
}

const toggleProjectList = () => {
  hideProjectList.value = !hideProjectList.value
}

const leftMargin = computed(() => {
  if (hideProjectList.value) {
    return 'left-0'
  } else if (selectedProjectId.value === null) {
    return 'left-98'
  } else {
    return 'left-198'
  }
})

const onEmitSwapTab = (tab: Tab) => {
  selectedTab.value = tab
  switch (tab) {
    case 'All': {
      projectResults.value = pdStore.allProjects
      break
    } case 'My projects': {
      projectResults.value = myProjects.value
      break
    }
  }
}

const onEmitSearch = debounce(async (keyword: string, isSelectedPublishedProjects: boolean) => {
  noResults.value = false
  if (keyword === '') {
    if (isSelectedPublishedProjects) {
      router.push({ name: ROUTE_NAMES.explore })
      await fetchSearch('', isSelectedPublishedProjects, 20, 0)
      return
    }
    projectResults.value = pdStore.allProjects
    router.push({ name: ROUTE_NAMES.explore })
    return
  }
  const searchResponse = await fetchSearch(keyword, isSelectedPublishedProjects, 100, 0)
  if (searchResponse === undefined || searchResponse.data.length === 0) {
    noResults.value = true
  } else {
    projectResults.value = searchResponse.data
    noResults.value = false
  }
  router.push({ name: ROUTE_NAMES.explore, query: { search: keyword } })
}, 500)

const onEmitLoadMore = async (isSelectedPublishedProjects: boolean) => {
  const LIMIT = 20
  const offset = pdStore.allProjectsWithMetricsOffset
  const total = pdStore.allProjects.length
  if (offset === total) return
  if (isLoading.value) return
  await fetchSearch('', isSelectedPublishedProjects, LIMIT, offset)
}

const onEmitLoadPublishedProjects = async (isSelectedPublishedProjects: boolean) => {
  if (isLoading.value) return
  pdStore.resetAllProjectsWithMetrics()
  await fetchSearch('', isSelectedPublishedProjects, 20, 0)
}

onMounted(async () => {
  if (typeof route.query.search === 'string' && route.query.search !== '') {
    searchInputFromQuery.value = route.query.search
  }
  // fetch all projects
  try {
    await fetchAllProjects()
    projectResults.value = pdStore.allProjects
  } catch (error) {
    isErrorLoadedProject.value = true
  }
  // fetch first 20 projects with metrics (to show in list) will be in load more
})

const fetchAllProjects = async () => {
  try {
    const allProjects = await apiBioGetProjectsGeo(apiClientBio)
    if (allProjects === undefined) throw new Error('Failed to fetch all projects')
    const p = allProjects as ProjectLight[]
    pdStore.updateAllProjects(p)
  } catch (error) {
    isErrorLoadedProject.value = true
  }
}

const fetchSearch = async (keyword: string, isPublished: boolean, limit: number, offset: number): Promise<{ total: number, data: ProjectProfileWithMetrics[]} | undefined> => {
  if (isLoading.value === true) return
  isLoading.value = true
  const searchResponse = await apiBioSearch(apiClientBio, 'project', keyword, isPublished, limit, offset)
  if (searchResponse === undefined) return
  const projectWithMetrics = (searchResponse.data as SearchResponseProject[]).map((p: SearchResponseProject): ProjectProfileWithMetrics => {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      objectives: p.objectives,
      summary: p.summary,
      imageUrl: p.thumbnail ?? p.image,
      latitudeAvg: p.avgLatitude,
      longitudeAvg: p.avgLongitude,
      noOfRecordings: p.recordingMinutesCount,
      noOfSpecies: p.speciesCount,
      countries: p.countryCodes,
      isPublished: p.status === 'published'
    }
  })
  pdStore.addProjectsWithMetrics(projectWithMetrics)
  isLoading.value = false
  return { total: searchResponse.total, data: projectWithMetrics }
}

watch(() => selectedTab.value, (newVal) => {
  if (newVal === 'All') {
    projectResults.value = pdStore.allProjects
  } else {
    projectResults.value = myProjects.value
  }
})

const noResults = ref(false)

</script>
