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
    <div v-else-if="currentStatus === BackupStatus.EXPIRED">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.86001 2.57347L1.21335 12.0001C1.09693 12.2018 1.03533 12.4303 1.03467 12.6631C1.03402 12.896 1.09434 13.1249 1.20963 13.3272C1.32492 13.5294 1.49116 13.698 1.69182 13.816C1.89247 13.9341 2.12055 13.9976 2.35335 14.0001H13.6467C13.8795 13.9976 14.1076 13.9341 14.3082 13.816C14.5089 13.698 14.6751 13.5294 14.7904 13.3272C14.9057 13.1249 14.966 12.896 14.9654 12.6631C14.9647 12.4303 14.9031 12.2018 14.7867 12.0001L9.14001 2.57347C9.02117 2.37754 8.85383 2.21555 8.65414 2.10313C8.45446 1.9907 8.22917 1.93164 8.00001 1.93164C7.77086 1.93164 7.54557 1.9907 7.34588 2.10313C7.1462 2.21555 6.97886 2.37754 6.86001 2.57347V2.57347Z"
          stroke="#A1A19E"
          stroke-width="1.33333"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 6V8.66667"
          stroke="#A1A19E"
          stroke-width="1.33333"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 11.3335H8.00667"
          stroke="#A1A19E"
          stroke-width="1.33333"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
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
