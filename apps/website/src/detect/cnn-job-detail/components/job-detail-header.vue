<template>
  <div class="flex justify-between">
    <nav
      class="flex justify-between"
      aria-label="Breadcrumb"
    >
      <ol class="inline-flex align-top space-x-1 md:space-x-2 rtl:space-x-reverse text-insight">
        <li class="inline-flex align-top text-sm font-display">
          <router-link
            :to="{ name: ROUTE_NAMES.cnnJobList }"
            class="inline-flex align-top hover:text-util-gray-02"
          >
            CNN Jobs
          </router-link>
        </li>
        <li class="flex align-top text-sm font-display text-insight">
          <icon-fas-chevron-right class="w-3 h-3 mr-2 mt-0.8" />
          <router-link
            :to="{ name: ROUTE_NAMES.cnnJobDetail, params: { jobId } }"
            class="inline-flex align-top hover:text-util-gray-02"
          >
            Job {{ jobId }}
          </router-link>
        </li>
      </ol>
    </nav>
    <div class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse hidden">
      <button
        v-if="isCancelJobEnable"
        class="btn btn-danger py-2 flex flex-row justify-center items-center"
      >
        <span class="pt-1">Cancel job</span>
        <icon-fa-trash class="h-4 w-4 ml-2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

const route = useRoute()
const jobId = computed(() => route.params.jobId)

withDefaults(defineProps<{ isCancelJobEnable: boolean }>(), {
  isCancelJobEnable: true
})
</script>
