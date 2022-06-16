<template>
  <tr class="border-b border-box-grey">
    <th
      scope="row"
      class="px-6 py-4 align-text-top"
    >
      {{ props.job.modelName }}
    </th>
    <td class="px-6 py-4 align-text-top w-80">
      <JobInput
        :number-of-recordings="props.job.numberOfRecordings"
        :job-input="props.job.input"
      />
    </td>
    <td class="px-6 py-4 align-text-top">
      {{ formatDateFull(props.job.createdAt) }}
    </td>
    <td class="px-6 py-4 align-text-top">
      <JobProgress
        :job-progress="props.job.progress"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import useDateFormat from '~/hooks/use-date-format'
import { Job } from '../../types'
import JobInput from './job-input.vue'
import JobProgress from './job-progress.vue'

const props = defineProps<{
  job: Job
}>()

const { formatDateFull } = useDateFormat()
</script>
