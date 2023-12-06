<template>
  <landing-navbar />
  <section class="static overflow-hidden">
    <project-list
      :data="projectResults"
      :selected-project-id="selectedProjectId ?? undefined"
      :selected-tab="selectedTab"
      class="absolute z-40 h-100vh"
      @emit-selected-project="onEmitSelectedProject"
      @emit-search="onEmitSearch"
      @emit-load-more="onEmitLoadMore"
    />
    <project-info
      v-if="selectedProjectId !== null"
      class="absolute z-40 h-50vh my-auto"
      :project-id="selectedProjectId"
    />
    <map-view
      :data="projectResults"
      class="relative left-0 z-30 w-full"
      :selected-project-id="selectedProjectId ?? undefined"
      @emit-selected-project="onEmitSelectedProject"
    />
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { useProjectDirectoryStore, useStore } from '~/store'
import MapView from './blocks/map-view.vue'
import ProjectInfo from './blocks/project-info.vue'
import ProjectList from './blocks/projects-list.vue'
import { getRawDirectoryProjects, toLightProjects } from './data/rawDirectoryProjectsData'
import type { ProjectLight, ProjectProfileWithMetrics } from './data/types'

const store = useStore()
const pdStore = useProjectDirectoryStore()
const selectedProjectId = ref<number | null>(null)

const selectedTab = ref<'all' | 'me'>('all')

/** mock db/api service, do not use in ui */
const allMockProjects = getRawDirectoryProjects(store.projects.map(p => ({ ...p, idArbimon: -1 })))
const myProjects: ProjectProfileWithMetrics[] = store.myProjects.map(p => ({ ...p, noOfRecordings: 0, noOfSpecies: 0, isHighlighted: true }))
const getProjectWithMetricsByIds = (ids: number[]) => {
  return allMockProjects.filter(p => ids.includes(p.id))
}
/** end mock */

/** List of projects (with profile) you got from search results, initial is the first 20 in the list -- to show in the list */
const projectResults = ref<ProjectLight[]>(pdStore.allProjects)

const onEmitSelectedProject = (locationProjectId: number) => {
  selectedProjectId.value = locationProjectId
}

// TODO: search with keyword
// TODO: scroll down to load more

const onEmitSearch = (keyword: string) => {
  console.info('search with keyword', keyword)
  switch (keyword) {
    case 'all':
      selectedTab.value = 'all'
      projectResults.value = pdStore.allProjects
      break
    case 'me':
      selectedTab.value = 'me'
      projectResults.value = myProjects
      break
    default:
      projectResults.value = pdStore.allProjects.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()))
      break
  }
}

const onEmitLoadMore = () => {
  // TODO: load more ProjectsWithMetrics
  const LIMIT = 20
  const offset = pdStore.allProjectsWithMetrics.length
  const total = pdStore.allProjects.length
  if (offset === total) return
  const ids = pdStore.allProjects.slice(offset, offset + LIMIT).map(p => p.id)
  const newSetOfData = getProjectWithMetricsByIds(ids)
  pdStore.updateAllProjectsWithMetrics(pdStore.allProjectsWithMetrics.concat(newSetOfData))
}

onMounted(() => {
  // TODO: change this to call real api once it's ready
  const allProjects = toLightProjects(allMockProjects)
  pdStore.updateAllProjects(allProjects)
  // TODO: load metrics (from api once it's ready)
  pdStore.updateAllProjectsWithMetrics(getProjectWithMetricsByIds(allProjects.slice(0, 20).map(p => p.id)))
  projectResults.value = pdStore.allProjects
})

watch(() => selectedTab.value, (newVal) => {
  if (newVal === 'all') {
    projectResults.value = pdStore.allProjects
  } else {
    projectResults.value = myProjects
  }
})

</script>
