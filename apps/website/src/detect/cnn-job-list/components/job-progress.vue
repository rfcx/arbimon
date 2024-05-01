<template>
  <div class="flex items-center">
    <div
      class="w-52 lg:w-68 bg-pitch rounded-full h-3 border-1"
      :class="classifierStatus.borderColor"
    >
      <div
        class="h-2.5 rounded-full"
        :style="`width: ${progressPercentage}%;`"
        :class="classifierStatus.bgColor"
      />
    </div>
    <span class="ml-2 ">{{ Math.min(props.current, 100) }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { CLASSIFIER_JOB_STATUS } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-status'

const props = defineProps<{
  status: number,
  current: number,
  total: number
}>()

const statusCode = computed(() => props.status)

const progressPercentage = computed(() => {
  if (props.total === 0) return 0
  return Math.min((props.current / props.total) * 100, 100)
})

const classifierStatus = computed(() => {
  if (statusCode.value === CLASSIFIER_JOB_STATUS.WAITING) {
    return {
      bgColor: 'bg-[#FF9457]',
      borderColor: 'border-[#FF9457]'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.RUNNING) {
    return {
      bgColor: 'bg-[#ADFF2C]',
      borderColor: 'border-[#ADFF2C]'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.DONE) {
    return {
      bgColor: 'bg-[#ADFF2C]',
      borderColor: 'border-[#ADFF2C]'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.ERROR) {
    return {
      bgColor: 'bg-ibis',
      borderColor: 'border-ibis'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.CANCELLED) {
    return {
      bgColor: 'bg-ibis',
      borderColor: 'border-ibis'
    }
  }

  if (statusCode.value === CLASSIFIER_JOB_STATUS.AWAITING_CANCELLATION) {
    return {
      bgColor: 'bg-ibis',
      borderColor: 'border-ibis'
    }
  }

  return { bgColor: '', borderColor: '' }
})

</script>
