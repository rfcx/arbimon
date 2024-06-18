<template>
  <div class="flex flex-row gap-2 items-center">
    <div
      v-if="currentStatus === BackupStatus.REQUESTED"
      class="w-4 h-4 border-frequency border-1 rounded-full"
    />
    <icon-custom-ic-progress
      v-else-if="currentStatus === BackupStatus.PROCESSING"
      class="w-4"
    />
    <icon-custom-ic-success
      v-else-if="currentStatus === BackupStatus.COMPLETED"
      class="w-4 fill-frequency text-frequency"
    />
    <icon-custom-alert-triangle
      v-else-if="currentStatus === BackupStatus.EXPIRED"
      class="w-4 h-4"
    />
    <span>{{ currentStatus }}</span>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

import { hasExpired } from '../utils'

enum BackupStatus {
  REQUESTED = 'Requested',
  PROCESSING = 'In progress',
  COMPLETED = 'Success',
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
    case 'processing': return BackupStatus.PROCESSING
    case 'requested': return BackupStatus.REQUESTED
    default: return 'unknown'
  }
}

const currentStatus = computed(() => getName(props.status, props.expiredDate))
</script>
