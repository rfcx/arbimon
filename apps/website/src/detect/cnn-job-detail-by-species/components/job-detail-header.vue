<template>
  <nav
    class="flex justify-between"
    aria-label="Breadcrumb"
  >
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse text-insight">
      <li class="inline-flex items-center text-sm font-display">
        <router-link
          :to="{ name: ROUTE_NAMES.cnnJobList }"
          class="inline-flex items-center hover:text-util-gray-02"
        >
          CNN Jobs
        </router-link>
      </li>
      <li>
        <div class="flex items-center text-sm font-display text-insight">
          <icon-fas-chevron-right class="w-3 h-3 mr-2" />
          <router-link
            :to="{ name: ROUTE_NAMES.cnnJobDetail, params: { jobId } }"
            class="inline-flex items-center hover:text-util-gray-02"
          >
            Job {{ jobId }}
          </router-link>
        </div>
      </li>
      <li>
        <div class="flex items-center text-sm font-display text-insight">
          <icon-fas-chevron-right class="w-3 h-3 mr-2" />
          {{ speciesName }}
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

withDefaults(defineProps<{ speciesName: string }>(), { speciesName: '' })

const route = useRoute()
const jobId = computed(() => typeof route.params.jobId === 'string' ? parseInt(route.params.jobId) : -1)
</script>
