<template>
  <div
    id="drawer-navigation"
    class="inset-y-auto left-0 fixed w-98 overflow-y-auto transition-transform -translate-x-full bg-moss selected:bg-pitch"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div class="h-full overflow-y">
      <p class="p-6 border-b border-frequency text-frequency">
        All projects ({{ props.data.length }})
      </p>
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
import type { ProjectLight } from '../data/types'

const props = defineProps<{ data: ProjectLight[], selectedProjectId: number | undefined }>()
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void, (e: 'emitLoadMore'): void
}>()

const pdStore = useProjectDirectoryStore()

const dataWithMetrics = computed(() => pdStore.allProjectsWithMetrics)
const isFetching = ref(false)

const loadMore = () => {
  emit('emitLoadMore')
}

const emitSelectedProject = (projectId: number) => {
  emit('emitSelectedProject', projectId)
}

</script>
