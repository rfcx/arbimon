<template>
  <div
    id="drawer-navigation"
    class="inset-y-auto left-0 fixed w-98 overflow-y-auto transition-transform -translate-x-full bg-moss selected:bg-pitch"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div class="h-full overflow-y">
      <ul class="p-6 border-b border-frequency text-frequency flex flex-row gap-4">
        <li
          class="cursor-pointer"
          :class="{'border-frequency border-b-2': selectedTab === 'all'}"
          @click="emitSearch('all')"
        >
          All projects
        </li>
        <li
          class="cursor-pointer"
          :class="{'border-frequency border-b-2': selectedTab === 'me'}"
          @click="emitSearch('me')"
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
import type { ProjectLight, ProjectProfileWithMetrics } from '../data/types'

const props = defineProps<{ data: ProjectLight[], selectedProjectId: number | undefined, selectedTab: string }>()
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void, (e: 'emitLoadMore'): void, (e: 'emitSearch', keyword: string): void
}>()

const pdStore = useProjectDirectoryStore()

const dataWithMetrics = computed((): ProjectProfileWithMetrics[] => {
  if (props.selectedTab === 'all') {
    return pdStore.allProjectsWithMetrics
  } else {
    return pdStore.getProjectWithMetricsByIds(props.data.map(p => p.id))
  }
})
const isFetching = ref(false)

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
