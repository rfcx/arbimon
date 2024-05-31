<template>
  <div class="mt-6 flex flex-col gap-y-4">
    <h4>
      Project backup
    </h4>
    <div class="flex flex-col xl:flex-row gap-6 justify-between">
      <div class="w-full xl:w-2/4">
        <p class="text-secondary">
          The project backup allows you to download all raw data from your Arbimon project, including CSV files for sites, species, playlists, recordings, validations, and job results (PM, RFM, soundscapes, etc.).
          You can use the links in recordings.csv to download all recordings. Backups can be requested every 7 days and the link will be ready within 24 hours. Note that download links expire after 7 days,
          so save your backup promptly. <br>
          <a
            class="text-frequency underline"
            href="https://help.arbimon.org/article/272-exporting-project-backups"
          >
            Learn more about project back-ups
          </a>
        </p>
        <button
          v-if="!isLoading"
          class="btn btn-medium mt-6"
          :class="!isAllowedToRequestNewBackup ? 'cursor-not-allowed btn-disabled' : 'btn-secondary'"
          type="button"
          :disabled="!isAllowedToRequestNewBackup || isPending"
          :title="!isAllowedToRequestNewBackup ? TEXT_BACKUP_LIMIT : ''"
          @click="isModalOpen = true"
        >
          <span>Request backup</span>
          <icon-custom-ic-export
            class="ml-2 inline-flex"
          />
        </button>
        <span
          v-if="!isAllowedToRequestNewBackup"
          class="ml-4 text-xs text-util-gray-02"
        >
          {{ TEXT_BACKUP_LIMIT }}
        </span>
      </div>
      <project-backup-history
        :data="data ?? []"
        :is-loading="isLoading"
        :error="error"
      />
    </div>
    <project-backup-modal
      :is-open="isModalOpen"
      :is-loading="isPending"
      :has-requested="hasRequested"
      :error-message="createErrorMessage"
      @emit-request-backup="requestNewBackup"
      @emit-close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { apiClientKey, togglesKey } from '@/globals'
import { useStore } from '~/store'
import ProjectBackupModal from './components/backup-modal.vue'
import ProjectBackupHistory from './components/project-backup-history-list.vue'
import { useCreateBackup, useGetBackup } from './composables/use-project-backup'

const TEXT_BACKUP_LIMIT = 'You can request a backup every 7 days'

const store = useStore()
const toggles = inject(togglesKey)

const timeFrameLimit = computed(() => {
  const hours = toggles?.projectBackupTesting === true ? 0.25 : 7 * 24
  return hours * 60 * 60 * 1000 // hours to milliseconds
})

const isAllowedToRequestNewBackup = computed((): boolean => {
  if (!data.value || data.value.length === 0) return true
  const requestedDates = data.value
    .map((item) => item.requestedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const recentRequestedDate = requestedDates.length > 0 ? requestedDates[0] : undefined
  if (recentRequestedDate === undefined) return true
  const diff = new Date().getTime() - new Date(recentRequestedDate).getTime()
  return diff > timeFrameLimit.value
})

// Modal
const isModalOpen = ref(false)
const hasRequested = ref(false)

const closeModal = () => {
  isModalOpen.value = false
  hasRequested.value = false
  createErrorMessage.value = undefined
}

// API - GET backup history (loading state, success, error)
const apiClientBio = inject(apiClientKey) as AxiosInstance
const { data, error, isLoading, refetch: refetchList } = useGetBackup(apiClientBio, store.project?.id ?? -1)

// API - POST request backup (loading state, success, error)
const { mutate, isPending } = useCreateBackup(apiClientBio)
const createErrorMessage = ref<string | undefined>(undefined)

const requestNewBackup = () => {
  createErrorMessage.value = undefined
  mutate({ entityId: store.project?.id ?? -1, entity: 'project' }, {
    onSuccess: () => {
      hasRequested.value = true
      refetchList()
    },
    onError: (error) => {
      hasRequested.value = false
      createErrorMessage.value = error.message
    }
  })
}
</script>
