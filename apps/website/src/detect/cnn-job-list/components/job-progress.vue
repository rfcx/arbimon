<template>
  <div
    class="flex flex-row items-center"
    :class="{ 'flex-col gap-1 !items-start': props.isCompact }"
  >
    <div class="flex items-center mr-6">
      <icon-custom-ic-circle
        v-if="props.status === 0"
        class="min-w-4"
      />
      <icon-custom-ic-progress
        v-else-if="props.status === 20"
        class="min-w-4"
      />
      <icon-custom-ic-success
        v-else-if="props.status === 30"
        class="min-w-4"
      />
      <icon-custom-ic-error
        v-else-if="props.status === 40"
        class="min-w-4"
      />
      <icon-custom-ic-cancelled
        v-else
        class="min-w-4"
      />
      <span
        class="ml-2 text-insight"
      >
        {{ classifierStatus.title }}
      </span>
    </div>
    <div
      class="flex items-center"
      :class="{ 'hidden': props.isCompact && props.status !== CLASSIFIER_JOB_STATUS.RUNNING }"
    >
      <div
        class=" rounded-full h-3 border-1"
        :class="[classifierStatus.borderColor, { 'w-52 lg:w-68': !isCompact, 'w-20 lg:w-24': isCompact }]"
      >
        <div
          class="h-2.5 rounded-full"
          :style="`width: ${progressPercentage}%;`"
          :class="classifierStatus.bgColor"
        />
      </div>
      <span class="ml-2 ">{{ Math.min(props.current, 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

const props = defineProps<{
  status: number,
  current: number,
  total: number,
  isCompact?: boolean
}>()

const statusCode = computed(() => props.status)

const progressPercentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min((props.current / props.total) * 100, 100)
})

const classifierStatus = computed(() => {
  if (statusCode.value === CLASSIFIER_JOB_STATUS.WAITING) {
    return {
      title: 'Queued',
      bgColor: 'bg-[#FF9457]',
      borderColor: 'border-[#FF9457]'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.RUNNING) {
    return {
      title: 'In progress',
      bgColor: 'bg-[#ADFF2C]',
      borderColor: 'border-[#ADFF2C]'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.DONE) {
    return {
      title: 'Success',
      bgColor: 'bg-[#ADFF2C]',
      borderColor: 'border-[#ADFF2C]'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.ERROR) {
    return {
      title: 'Error',
      bgColor: 'bg-ibis',
      borderColor: 'border-ibis'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.CANCELLED) {
    return {
      title: 'Cancelled',
      bgColor: 'bg-ibis',
      borderColor: 'border-ibis'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.AWAITING_CANCELLATION) {
    return {
      title: 'Cancelling',
      bgColor: 'bg-ibis',
      borderColor: 'border-ibis'
    }
  }

  return { title: '', bgColor: '', borderColor: '' }
})

</script>
