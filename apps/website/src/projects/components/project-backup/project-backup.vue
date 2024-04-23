<template>
  <div class="mt-6 flex flex-col gap-y-4">
    <h4>
      Project backup
    </h4>
    <div class="flex flex-col xl:flex-row gap-6 justify-between">
      <div class="w-full xl:w-2/4">
        <p>
          You can request a comprehensive backup—including all raw recordings, job results, metadata, and Insights visuals—every 7 days. Once requested, your download link will be ready within 24 hours. Remember, download links expire after 7 days, so be sure to save your backup promptly.
        </p>
        <button
          class="btn mt-6"
          :class="!isAllowedToRequestNewBackup ? 'cursor-not-allowed btn-disabled' : 'btn-secondary'"
          type="button"
          :disabled="!isAllowedToRequestNewBackup"
          :title="!isAllowedToRequestNewBackup ? 'You can request a backup every 7 days' : ''"
        >
          Request backup <icon-custom-ic-export class="ml-2 inline-flex" />
        </button>
      </div>
      <project-backup-history :data="recentBackups(dataMock)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import ProjectBackupHistory from './components/project-backup-history-list.vue'
import { type BackupHistory } from './types'

const date = new Date(Date.now() + 30 * 60 * 1000).toISOString()

const dataMock = ref<BackupHistory[]>([
  { requestDate: '2021-09-01', link: '#', status: 'available', expiryDate: '2021-09-08T04:00:00z' },
  { requestDate: '2021-09-25', link: '#', status: 'requested', expiryDate: undefined },
  { requestDate: '2021-09-01', link: '#', status: 'processing', expiryDate: undefined },
  { requestDate: date, link: '#', status: 'available', expiryDate: date }
])

// filter the recent 3 backups
const recentBackups = (data: BackupHistory[]): BackupHistory[] => {
  const ascSort = (a: BackupHistory, b: BackupHistory) => {
    return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime()
  }
  const dscSort = (a: BackupHistory, b: BackupHistory) => {
    return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  }
  const backupRecentDSC = data.sort(dscSort)
  return backupRecentDSC.slice(0, 3) // maximum 3 items
    .sort(ascSort)
}

const isAllowedToRequestNewBackup = computed((): boolean => {
  const requestedDates = dataMock.value
    .map((item) => item.requestDate)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const recendRequestedDate = requestedDates.length > 0 ? requestedDates[0] : undefined
  if (!recendRequestedDate) return true
  const diff = new Date().getTime() - new Date(recendRequestedDate).getTime()
  return diff > 7 * 24 * 60 * 60 * 1000 // 7 days
})

// TODO: add confirm dialog when the user click to request backup
// TODO: API call to request backup (loading state, success, error)
// TODO: API call to get backup history (loading state, success, error)

</script>
