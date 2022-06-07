<template>
  <tr class="border-b border-box-grey">
    <th
      scope="row"
      class="px-6 py-4 align-text-top"
    >
      {{ props.job.modelName }}
    </th>
    <td class="px-6 py-4 align-text-top">
      <JobInput
        :number-of-recordings="props.job.numberOfRecordings"
        :job-input="props.job.input"
      />
    </td>
    <td class="px-6 py-4 align-text-top">
      {{ props.job.createdAt }}
    </td>
    <td class="px-6 py-4 align-text-top">
      <JobProgress
        :job-progress="props.job.progress"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">

import { Job } from '~/job'
import JobInput from './job-input.vue'
import JobProgress from './job-progress.vue'

  const props = defineProps<{
    job: Job
  }>()
</script>
