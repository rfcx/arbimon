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
          :disabled="!isAllowedToRequestNewBackup || isPending"
          :title="!isAllowedToRequestNewBackup ? TEXT_BACKUP_LIMIT : ''"
          @click="requestNewBackup"
        >
          <span>Request backup</span>
          <icon-custom-ic-loading
            v-if="isPending"
            class="ml-2 w-4 inline-flex"
          />
          <icon-custom-ic-export
            class="ml-2 inline-flex"
          />
        </button>
        <span
          v-if="!isAllowedToRequestNewBackup"
          class="ml-4 text-xs text-util-gray-03"
        >
          {{ TEXT_BACKUP_LIMIT }}
        </span>
        <span
          v-else-if="createErrorMessage"
          class="ml-4 text-xs text-danger"
        >
          {{ createErrorMessage }}
        </span>
      </div>
      <project-backup-history
        :data="data ?? []"
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

const TIME_TO_EXPIRE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const TEXT_BACKUP_LIMIT = 'You can request a backup every 7 days'

const store = useStore()

const isAllowedToRequestNewBackup = computed((): boolean => {
  if (!data.value || data.value.length === 0) return true
  const requestedDates = data.value
    .map((item) => item.requestedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const recentRequestedDate = requestedDates.length > 0 ? requestedDates[0] : undefined
  if (recentRequestedDate === undefined) return true
  const diff = new Date().getTime() - new Date(recentRequestedDate).getTime()
  return diff > TIME_TO_EXPIRE
})

// TODO: add confirm dialog when the user click to request backup

// API - GET backup history (loading state, success, error)
const apiClientBio = inject(apiClientKey) as AxiosInstance
const { data, error, isLoading, refetch: refetchList } = useGetBackup(apiClientBio, store.project?.id ?? -1)

// API - POST request backup (loading state, success, error)
const { mutate, isPending } = useCreateBackup(apiClientBio)
const createErrorMessage = ref<string | undefined>(undefined)

const requestNewBackup = () => {
  mutate({ entityId: store.project?.id ?? -1, entity: 'project' }, {
    onSuccess: () => { refetchList() },
    onError: (error) => { createErrorMessage.value = error.message }
  })
}
</script>
