<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      v-if="!hideProjectList"
      :data="projectResults"
      :selected-project-id="selectedProjectId ?? undefined"
      :selected-tab="selectedTab"
      class="absolute z-40 h-100vh"
      @emit-selected-project="onEmitSelectedProject"
      @emit-search="onEmitSearch"
      @emit-load-more="onEmitLoadMore"
      @emit-swap-tab="onEmitSwapTab"
    />
    <project-info
      v-if="selectedProjectId !== null && !hideProjectList"
      class="absolute z-40 h-86vh mt-10"
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
      class="relative left-0 z-30 w-full"
      :selected-project-id="selectedProjectId ?? undefined"
      @emit-selected-project="onEmitSelectedProject"
    />
  </section>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, onMounted, ref, watch } from 'vue'

import { type ProjectLight, type ProjectProfileWithMetrics, apiBioGetDirectoryProjects } from '@rfcx-bio/common/api-bio/project/projects'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { useProjectDirectoryStore, useStore } from '~/store'
import MapView from './blocks/map-view.vue'
import ProjectInfo from './blocks/project-info.vue'
import ProjectList from './blocks/projects-list.vue'
import type { Tab } from './data/types'

const store = useStore()
const pdStore = useProjectDirectoryStore()
const selectedProjectId = ref<number | null>(null)
const hideProjectList = ref<boolean>(false)

const apiClientBio = inject(apiClientKey) as AxiosInstance

const selectedTab = ref<Tab>('All')

const isLoading = ref(false)

/** List of projects (with profile) you got from search results, initial is the first 20 in the list -- to show in the list */
const projectResults = ref<ProjectLight[]>(pdStore.allProjects)

const myProjects = computed(() => {
  const myProjectIds = store.projects.filter(p => p.isMyProject).map(p => p.id)
  return pdStore.allProjects.filter(p => myProjectIds.includes(p.id))
})

const onEmitSelectedProject = (locationProjectId: number) => {
  selectedProjectId.value = locationProjectId
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

const onEmitSearch = async (keyword: string) => {
    const projectsInCriteria = pdStore.allProjects.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()))
    projectResults.value = projectsInCriteria
    const ids = projectsInCriteria.map(p => p.id)
    const projectsWithMetrics = pdStore.getProjectWithMetricsByIds(ids)
    if (projectsWithMetrics.length === ids.length) return
    await fetchProjectsWithMetricsByIds(ids)
}

const onEmitLoadMore = async () => {
  const LIMIT = 20
  const offset = pdStore.allProjectsWithMetrics.length
  const total = pdStore.allProjects.length
  if (offset === total) return
  if (isLoading.value) return
  const ids: number[] = pdStore.allProjects.slice(offset, offset + LIMIT).map(p => p.id)
  await fetchProjectsWithMetricsByIds(ids)
}

onMounted(async () => {
  // fetch all projects
  await fetchAllProjects()
  projectResults.value = pdStore.allProjects
  // fetch first 20 projects with metrics (to show in list) will be in load more
})

const fetchAllProjects = async () => {
  const dataLight = await apiBioGetDirectoryProjects(apiClientBio, { full: false })
  if (dataLight !== undefined) {
    const p = dataLight as ProjectLight[]
    pdStore.updateAllProjects(p)
  }
}

const fetchProjectsWithMetricsByIds = async (ids: number[]) => {
  isLoading.value = true
  const dataFull = await apiBioGetDirectoryProjects(apiClientBio, { full: true, ids: ids.join(',') })
  if (dataFull === undefined) return
  pdStore.addProjectsWithMetrics(dataFull as ProjectProfileWithMetrics[])
  isLoading.value = false
}

watch(() => selectedTab.value, (newVal) => {
  if (newVal === 'All') {
    projectResults.value = pdStore.allProjects
  } else {
    projectResults.value = myProjects.value
  }
})

</script>
