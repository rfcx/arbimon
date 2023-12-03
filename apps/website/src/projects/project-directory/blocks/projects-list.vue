<template>
  <div
    id="drawer-navigation"
    class="inset-y-auto left-0 fixed w-98 overflow-y-auto transition-transform -translate-x-full bg-moss"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div class="h-full overflow-y">
      <p class="p-6 border-b border-frequency text-frequency">
        All projects ({{ props.data.length }})
      </p>
      <div v-infinite-scroll="loadMore">
        <ul>
          <project-list-item
            v-for="p in partialData"
            :key="p.id"
            :project="p"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import ProjectListItem from '../components/project-list-item.vue'
import type { ProjectProfileWithMetrics } from '../data/types'

const LIMIT = 20
const props = defineProps<{ data: ProjectProfileWithMetrics[] }>()
const partialData = ref(props.data.slice(0, LIMIT))

const loadMore = () => {
  const nextLength = partialData.value.length + LIMIT
  if (nextLength > props.data.length) return
  partialData.value = props.data.slice(0, nextLength)
}
</script>
