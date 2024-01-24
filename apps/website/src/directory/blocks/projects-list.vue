<template>
  <div
    id="drawer-navigation"
    class="inset-y-auto left-0 fixed w-98 overflow-y-auto transition-transform -translate-x-full bg-moss selected:bg-pitch"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div class="h-full overflow-y">
      <div class="p-6">
        <input
          v-model="searchKeyword"
          class="input-field w-full p-3 rounded"
          placeholder="Search by project name, objectives, countries, etc."
          @input="emitSearch(searchKeyword)"
        >
      </div>
      <ul
        v-if="false"
        class="p-6 border-b border-chirp text-frequency flex flex-row gap-10"
      >
        <li
          class="cursor-pointer font-medium"
          :class="{'border-frequency border-b-4': selectedTab === 'All'}"
          @click="emitSwapTab('All')"
        >
          All
        </li>
        <li
          class="cursor-pointer font-medium"
          :class="{'border-frequency border-b-4': selectedTab === 'My projects'}"
          @click="emitSwapTab('My projects')"
        >
          My projects
        </li>
      </ul>
      <div
        v-infinite-scroll="loadMore"
        :infinite-scroll-distance="40"
      >
        <ul>
          <project-list-item
            v-for="p in dataWithMetrics"
            :key="p.id"
            :project="p"
            :is-selected="p.id === props.selectedProjectId"
            @click="emitSelectedProject(p.id)"
          />
          <li
            v-if="isFetching"
            class="p-6 text-center bg-frequency text-white"
          >
            Loading...
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useProjectDirectoryStore } from '~/store'
import ProjectListItem from '../components/project-list-item.vue'
import type { ProjectLight, ProjectProfileWithMetrics, Tab } from '../data/types'

const props = defineProps<{ data: ProjectLight[], selectedProjectId: number | undefined, selectedTab: Tab }>()
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void, (e: 'emitLoadMore'): void, (e: 'emitSearch', keyword: string): void, (e: 'emitSwapTab', tab: Tab): void
}>()

const pdStore = useProjectDirectoryStore()

const isFetching = ref(false)
const searchKeyword = ref('')

const dataWithMetrics = computed((): ProjectProfileWithMetrics[] => {
  if (props.selectedTab === 'All' && searchKeyword.value === '') {
    return pdStore.allProjectsWithMetrics
  } else {
    const id = props.data.map((p: ProjectLight): number => p.id)
    return pdStore.getProjectWithMetricsByIds(id)
  }
})

const emitSwapTab = (tab: Tab) => {
  emit('emitSwapTab', tab)
}

const loadMore = () => {
  emit('emitLoadMore')
}

const emitSelectedProject = (projectId: number) => {
  emit('emitSelectedProject', projectId)
}

const emitSearch = (keyword: string) => {
  emit('emitSearch', keyword)
}

</script>
