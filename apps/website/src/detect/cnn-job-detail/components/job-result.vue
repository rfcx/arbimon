<template>
  <div class="job-result-wrapper">
    <section-title>
      <template #title>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">
            Results
          </h2>
        </div>
      </template>
      <template #controls>
        <job-result-filter />
      </template>
    </section-title>
    <div class="grid grid-cols-4 gap-4 <lg:grid-cols-7 pt-2">
      <div class="col-span-3 <lg:col-span-5 <md:col-span-7 border-1 border-box-gray rounded-md px-6 py-4 w-full">
        <job-result-detection-summary />
      </div>
      <div class="col-span-1 <lg:col-span-2 <md:col-span-7 border-1 border-box-gray rounded-md px-6 py-4 w-full">
        <job-result-validation-status />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive } from 'vue'

import { useStore } from '~/store'
import JobResultDetectionSummary from './job-result-detection-summary.vue'
import JobResultFilter from './job-result-filter.vue'
import JobResultValidationStatus from './job-result-validation-status.vue'

const store = useStore()

const project = reactive({
  projectId: '-1'
})

onMounted(() => {
  project.projectId = store.selectedProject?.id.toString() ?? '-1'
})

</script>
