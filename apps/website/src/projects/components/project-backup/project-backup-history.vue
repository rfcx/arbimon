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
      <tr v-if="data.length > 0">
        <td>..</td>
        <td>
          <a href="#">Download</a>
        </td>
        <td>..</td>
        <td>..</td>
      </tr>
      <tr v-else>
        <td
          colspan="4"
          class="py-4"
        >
          Looks like you haven’t set up any backups yet.
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { type BackupHistory } from './types'

defineProps<{
  data: BackupHistory[]
}>()
</script>
