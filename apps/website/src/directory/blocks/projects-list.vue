<template>
  <div
    id="drawer-navigation"
    class="inset-y-auto left-0 fixed w-98 overflow-y-auto transition-transform -translate-x-full bg-moss selected:bg-pitch"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div class="h-full overflow-y">
      <div class="px-6 pt-6">
        <input
          v-model="searchKeyword"
          class="input-field w-full p-4 rounded"
          placeholder="Search by project name"
          @keyup.enter="emitSearch(searchKeyword)"
        >
      </div>
      <ul class="p-6 border-b border-chirp text-frequency flex flex-row gap-10">
        <li
          class="cursor-pointer font-medium"
          :class="{'border-frequency border-b-4': selectedTab === 'All'}"
          @click="onSelectTab('All')"
        >
          All
        </li>
        <li
          class="cursor-pointer font-medium"
          :class="{'border-frequency border-b-4': selectedTab === 'My projects'}"
          @click="onSelectTab('My projects')"
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
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void, (e: 'emitLoadMore'): void, (e: 'emitSearch', keyword: string): void
}>()

const pdStore = useProjectDirectoryStore()

const dataWithMetrics = computed((): ProjectProfileWithMetrics[] => {
  if (searchKeyword.value === 'All' || (props.selectedTab === 'All' && searchKeyword.value === 'All')) {
    return pdStore.allProjectsWithMetrics
  } else {
    return pdStore.getProjectWithMetricsByIds(props.data.map(p => p.id))
  }
})

const isFetching = ref(false)
const searchKeyword = ref('')

const onSelectTab = (name: string) => {
  if (name === 'My projects') {
    searchKeyword.value = 'My projects'
    emit('emitSearch', 'My projects')
  } else {
    searchKeyword.value = 'All'
    emit('emitSearch', 'All')
  }
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
