<template>
  <tr class="border-b border-box-grey">
    <th
      scope="row"
      class="px-6 py-4"
    >
      {{ props.job.modelName }}
    </th>
    <td class="px-6 py-4">
      {{ props.job.numberOfRecordings }} recordings
    </td>
    <td class="px-6 py-4">
      {{ props.job.createdAt }}
    </td>
    <td class="px-6 py-4">
      <jobProgressVue
        :job-progress="props.job.progress"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">

import { Job } from '~/job'
  import jobProgressVue from './job-progress.vue'

  const props = defineProps<{
    job: Job
  }>()
</script>
