<template>
  <div class="w-full xl:w-2/4">
    <table class="p-4 w-full text-left">
      <tr class="border-b-1 border-util-gray-03 text-secondary">
        <th class="pb-2">
          Request date
        </th>
        <th class="min-w-20">
          Link
        </th>
        <th>Status</th>
        <th>Link expiry date</th>
      </tr>
      <tr v-if="isLoading">
        <td
          v-for="i in 4"
          :key="i"
          class="py-4"
        >
          <div class="w-10/12 h-4 loading-shimmer rounded" />
        </td>
      </tr>
      <tr v-else-if="error">
        <td
          colspan="4"
          class="py-4 text-secondary"
        >
          {{ error }}
        </td>
      </tr>
      <tr v-else-if="data.length === 0">
        <td
          colspan="4"
          class="py-4 text-secondary"
        >
          Looks like you haven't requested a backup recently.
        </td>
      </tr>
      <tr
        v-for="item in data"
        v-else
        :key="item.id"
        class="border-b-1 border-util-gray-03 text-secondary"
      >
        <td class="py-1">
          {{ formattedDate(item.requestedAt) }}
        </td>
        <td>
          <a
            v-if="item.status === 'available' && item.url && (item.expiresAt ? !hasExpired(item.expiresAt) : true)"
            :href="item.url"
            class="text-frequency"
          >Download link</a>
          <span
            v-else-if="item.status === 'available' && (item.expiresAt ? hasExpired(item.expiresAt) : true)"
            class="text-util-gray-02 cursor-not-allowed"
          >Download link</span>
          <span v-else>Not yet available</span>
        </td>
        <td>
          <backup-status
            :status="item.status"
            :expired-date="item.expiresAt"
          />
        </td>
        <td id="expired-date-text">
          {{ getExpiredDate(item.status, item.expiresAt ) }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

import type { Backup } from '@rfcx-bio/common/dao/types/backup'

import { hasExpired } from '../utils'
import BackupStatus from './backup-status.vue'

defineProps<{
  data: Backup[]
  isLoading: boolean
  error: Error | null
}>()
// Date utility

const formattedDate = (date: Date, includedTime = false): string => {
  return dayjs(date).format(`YYYY-MM-DD ${includedTime ? 'HH:mm' : ''}`)
}

// Text utility

// Return the expired date based on the status
const getExpiredDate = (status: string, expiredDate?: Date): string => {
  if (['requested', 'processing'].includes(status) || expiredDate === undefined) return 'n/a'
  return formattedDate(expiredDate, true)
}
</script>
