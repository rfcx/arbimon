<template>
  <div class="w-full xl:w-2/4">
    <h6>Previous backup requests:</h6>
    <table class="p-4 mt-2 w-full text-left">
      <tr class="border-b-1 border-util-gray-03">
        <th class="py-2">
          Request date
        </th>
        <th>Link</th>
        <th>Status</th>
        <th>Link expiry date</th>
      </tr>
      <tr v-if="data.length === 0">
        <td
          colspan="4"
          class="py-4"
        >
          Looks like you haven’t set up any backups yet.
        </td>
      </tr>
      <tr
        v-for="item in data"
        :key="item.requestDate"
        class="border-b-1 border-util-gray-03"
      >
        <td class="py-1">
          {{ formattedDate(item.requestDate) }}
        </td>
        <td>
          <a
            v-if="item.status === 'available' && (item.expiryDate ? !hasExpired(item.expiryDate) : true)"
            :href="item.link"
            class="text-frequency"
          >Download link</a>
          <span
            v-else-if="item.status === 'available'"
            class="text-util-gray-03 cursor-not-allowed"
          >Download link</span>
          <span v-else>Not yet available</span>
        </td>
        <td>
          <backup-status
            :status="item.status"
            :expired-date="item.expiryDate"
          />
        </td>
        <td id="expired-date-text">
          {{ getExpiredDate(item.status, item.expiryDate ) }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

import { type BackupHistory } from '../types'
import { hasExpired } from '../utils'
import BackupStatus from './backup-status.vue'

defineProps<{
  data: BackupHistory[]
}>()
// Date utility

const formattedDate = (date: string, includedTime = false): string => {
  return dayjs(date).format(`YYYY-MM-DD ${includedTime ? 'HH:mm' : ''}`)
}

// Text utility

// Return the expired date based on the status
const getExpiredDate = (status: string, expiredDate?: string): string => {
  if (['requested', 'processing'].includes(status) || expiredDate === undefined) return 'n/a'
  return formattedDate(expiredDate, true)
}
</script>
