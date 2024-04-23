<template>
  <div
    v-if="currentStatus === BackupStatus.REQUESTED"
    class="flex flex-row gap-2 items-center"
  >
    <div class="w-4 h-4 border-frequency border-1 rounded-full" />
    <span>Requested</span>
  </div>
  <div
    v-else-if="currentStatus === BackupStatus.PROCESSING"
    class="flex flex-row gap-2 items-center"
  >
    <icon-custom-ic-progress class="w-4" />
    <span>In progress</span>
  </div>
  <div
    v-else-if="currentStatus === BackupStatus.COMPLETED"
    class="flex flex-row gap-2 items-center"
  >
    <icon-custom-ic-success class="w-4 fill-frequency text-frequency" />
    <span>Completed</span>
  </div>
  <div
    v-else-if="currentStatus === BackupStatus.EXPIRED"
    class="flex flex-row gap-2 items-center"
  >
    <div class="w-4 h-4 border-util-gray-03 bg-util-gray-03 border-1 rounded-full" />
    <span>Expired</span>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

import { hasExpired } from '../utils'

enum BackupStatus {
  REQUESTED = 'Requested',
  FAILED = 'Failed',
  PROCESSING = 'In progress',
  COMPLETED = 'Completed',
  EXPIRED = 'Expired'
}

const props = defineProps<{
  status: string
  expiredDate?: Date
}>()

// Return the status name based on the status
const getName = (status: string, expiredDate?: Date): string => {
  const isExpired = expiredDate ? hasExpired(expiredDate) : false
  switch (status) {
    case 'available': return isExpired ? BackupStatus.EXPIRED : BackupStatus.COMPLETED
    case 'failed': return BackupStatus.FAILED
    case 'processing': return BackupStatus.PROCESSING
    case 'requested': return BackupStatus.REQUESTED
    default: return 'unknown'
  }
}

const currentStatus = computed(() => getName(props.status, props.expiredDate))
</script>
