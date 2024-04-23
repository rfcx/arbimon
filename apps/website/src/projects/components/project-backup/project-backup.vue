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
          v-if="!isLoading"
          class="btn btn-medium mt-6"
          :class="!isAllowedToRequestNewBackup ? 'cursor-not-allowed btn-disabled' : 'btn-secondary'"
          type="button"
          :disabled="!isAllowedToRequestNewBackup"
          :title="!isAllowedToRequestNewBackup ? TEXT_BACKUP_LIMIT : ''"
          @click="requestNewBackup"
        >
          Request backup <icon-custom-ic-export class="ml-2 inline-flex" />
        </button>
        <span
          v-if="!isAllowedToRequestNewBackup"
          class="ml-4 text-xs text-util-gray-03"
        >
          {{ TEXT_BACKUP_LIMIT }}
        </span>
        <span
          v-if="createErrorMessage"
          class="ml-4 text-xs text-danger"
        >
          {{ createErrorMessage }}
        </span>
      </div>
      <project-backup-history
        :data="recentBackups(dataMock)"
        :is-loading="isLoading"
        :error="error"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { apiClientKey } from '@/globals'
import { useStore } from '~/store'
import ProjectBackupHistory from './components/project-backup-history-list.vue'
import { useCreateBackup, useGetBackup } from './composables/use-project-backup'
import { type BackupHistory } from './types'

const TIME_TO_EXPIRE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const TEXT_BACKUP_LIMIT = 'You can request a backup every 7 days'

const store = useStore()

const dataMock = ref<BackupHistory[]>([
  { requestDate: '2023-04-23', link: '#', status: 'available', expiryDate: '2021-09-08T04:00:00z' },
  { requestDate: '2021-09-25', link: '#', status: 'requested', expiryDate: undefined },
  { requestDate: '2021-09-01', link: '#', status: 'processing', expiryDate: undefined }
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
  return diff > TIME_TO_EXPIRE
})

// TODO: add confirm dialog when the user click to request backup

// API - GET backup history (loading state, success, error)
const apiClientBio = inject(apiClientKey) as AxiosInstance
const { data, error, isLoading, refetch: refetchList } = useGetBackup(apiClientBio, store.project?.id ?? -1)

// API - POST request backup (loading state, success, error)
const { mutate } = useCreateBackup(apiClientBio)
const createErrorMessage = ref<string | undefined>(undefined)

const requestNewBackup = () => {
  mutate({ entityId: store.project?.id ?? -1, entity: 'project' }, {
    onSuccess: () => { refetchList() },
    onError: (error) => { createErrorMessage.value = error.message }
  })
}
</script>
