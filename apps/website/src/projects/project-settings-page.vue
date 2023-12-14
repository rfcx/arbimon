<template>
  <section class="bg-white dark:bg-pitch pl-18">
    <div class="px-8 md:px-10 pt-20 pb-10 mx-auto max-w-screen-xl lg:py-24">
      <h1 class="text-gray-900 dark:text-insight">
        Project settings
      </h1>
      <p class="mt-4 text-fog">
        Review your project information.
      </p>
      <div class="grid mt-6 lg:(grid-cols-2 gap-10)">
        <div>
          <project-form
            :existing-name="selectedProject?.name"
            :date-start="settings?.dateStart"
            :date-end="settings?.dateEnd"
            :is-disabled="projectUserPermissionsStore.isGuest"
            @emit-update-value="onEmitDefaultValue"
          />
          <project-summary-form
            :existing-summary="settings?.summary"
            :is-disabled="projectUserPermissionsStore.isGuest"
            @emit-project-summary="onEmitSummary"
          />
        </div>
        <div>
          <project-objective-form
            :existing-objectives="settings?.objectives"
            :is-disabled="projectUserPermissionsStore.isGuest"
            @emit-project-objectives="onEmitObjectives"
          />
        </div>
      </div>
      <GuestBanner
        v-if="projectUserPermissionsStore.isGuest"
        class="mt-4"
      />
      <div class="mt-4 sm:mt-6 flex flex-row-reverse items-center gap-4">
        <button
          :disabled="projectUserPermissionsStore.isGuest || isSaving"
          class="self-end inline-flex items-center btn btn-primary disabled:hover:btn-disabled disabled:btn-disabled"
          @click.prevent="save"
        >
          Save edit
        </button>
        <div
          v-if="isSaving"
          class="inline-flex"
        >
          <icon-fas-spinner class="animate-spin" />
          <span class="ml-2">
            Saving...
          </span>
        </div>
        <span
          v-if="lastUpdated && !hasFailed && !isSaving"
          class="p-4 text-sm inline-flex"
          role="alert"
        >
          <icon-fa-check />
          <span class="font-medium ml-2">{{ lastUpdatedText }}</span>
        </span>
        <span
          v-if="hasFailed"
          class="p-4 text-sm text-red-800 dark:text-flamingo"
          role="alert"
        >
          <span class="font-medium">{{ errorMessage }}</span>
        </span>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { apiClientKey } from '@/globals'
import { useDashboardStore, useProjectUserPermissionsStore, useStore } from '~/store'
import GuestBanner from '../_layout/components//guest-banner/guest-banner.vue'
import { useGetProjectSettings, useUpdateProjectSettings } from './_composables/use-project-profile'
import { verifyDateFormError } from './components/form/functions'
import ProjectForm from './components/form/project-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import ProjectSummaryForm from './components/form/project-summary-form.vue'
import type { ProjectDefault } from './types'

const store = useStore()
const projectUserPermissionsStore = useProjectUserPermissionsStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProject = computed(() => store.selectedProject)
const selectedProjectId = computed(() => store.selectedProject?.id)

const { data: settings } = useGetProjectSettings(apiClientBio, selectedProjectId)
const { mutate: mutateProjectSettings } = useUpdateProjectSettings(apiClientBio, store.selectedProject?.id ?? -1)

const newName = ref('')
const dateStart = ref<string | null>(null)
const dateEnd = ref<string | null>(null)
const onGoing = ref(false)
const newSummary = ref('')
const newObjectives = ref([''])
const isSaving = ref(false)
const DEFAULT_ERROR_MSG = 'Failed!'
const hasFailed = ref(false)
const lastUpdated = ref(false)
const errorMessage = ref<string>(DEFAULT_ERROR_MSG)
const lastUpdatedText = ref<string>()

// update form values
const onEmitDefaultValue = (value: ProjectDefault) => {
  newName.value = value.name
  dateStart.value = value.startDate
  dateEnd.value = value.endDate
  onGoing.value = value.onGoing
}

const onEmitSummary = (value: string) => {
  newSummary.value = value
}

const onEmitObjectives = (value: string[]) => {
  newObjectives.value = value
}

watch(() => selectedProject.value, () => {
  if (!selectedProject.value) return
  newName.value = selectedProject.value.name
})

watch(() => settings.value, () => {
  if (!settings.value) return
  newName.value = settings.value.name
  newSummary.value = settings.value.summary
  newObjectives.value = settings.value.objectives

  if (settings.value.dateStart !== null) {
    dateStart.value = dayjs(settings.value.dateStart).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  }

  if (settings.value.dateEnd !== null) {
    dateEnd.value = dayjs(settings.value.dateEnd).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  }

  onGoing.value = dateStart.value?.length !== 0 && dateEnd.value?.length === 0
})

const save = () => {
  const dateError = verifyDateFormError(dateStart.value ? dateStart.value : undefined, dateEnd.value ? dateEnd.value : undefined, onGoing.value)
  if (dateError.length > 0) {
    hasFailed.value = true
    errorMessage.value = dateError
    return
  }
  hasFailed.value = false
  isSaving.value = true
  updateSettings()
}

const updateSettings = () => {
  mutateProjectSettings({
    name: newName.value,
    summary: newSummary.value,
    objectives: newObjectives.value,
    dateStart: dateStart.value ? dateStart.value : null,
    dateEnd: onGoing.value ? null : dateEnd.value ? dateEnd.value : null
  }, {
    onSuccess: () => {
      isSaving.value = false
      lastUpdated.value = true
      lastUpdatedText.value = `Last saved on ${dayjs(new Date()).format('MMM DD, YYYY')} at ${dayjs(new Date()).format('HH:mm:ss')}`
      store.updateProjectName(newName.value)
      dashboardStore.updateProjectObjectives(newObjectives.value)
      dashboardStore.updateProjectSummary(newSummary.value)
    },
    onError: (e) => {
      isSaving.value = false
      hasFailed.value = true
      lastUpdated.value = false
      errorMessage.value = DEFAULT_ERROR_MSG
      console.info(e)
    }
  })
}

</script>
