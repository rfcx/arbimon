<template>
  <section class="bg-white dark:bg-echo pl-18">
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
            :allow-name-changes="false"
            :date-start="settings?.dateStart"
            :date-end="settings?.dateEnd"
            @emit-update-value="onEmitDefaultValue"
          />
          <project-summary-form
            :existing-summary="settings?.summary"
            @emit-project-summary="onEmitSummary"
          />
        </div>
        <div>
          <project-objective-form
            :existing-objectives="settings?.objectives"
            @emit-project-objectives="onEmitObjectives"
          />
        </div>
      </div>
      <div class="mt-4 sm:mt-6 flex flex-row-reverse items-center gap-4">
        <button
          class="self-end inline-flex items-center btn btn-primary"
          @click.prevent="save"
        >
          Save edit
        </button>
        <svg
          v-if="isSaving"
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 ml-4 text-white animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>
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

import { apiClientBioKey } from '@/globals'
import { useDashboardStore, useStore } from '~/store'
import { useGetProjectSettings, useUpdateProjectSettings } from './_composables/use-project-profile'
import { verifyDateFormError } from './components/form/functions'
import ProjectForm from './components/form/project-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import ProjectSummaryForm from './components/form/project-summary-form.vue'
import type { ProjectDefault } from './types'

const store = useStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
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
const errorMessage = ref<string>(DEFAULT_ERROR_MSG)

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

  const start = dayjs(settings.value.dateStart).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  dateStart.value = start
  if (settings.value.dateEnd !== null) {
    const end = dayjs(settings.value.dateEnd).format('YYYY-MM-DD') + 'T00:00:00.000Z'
    dateEnd.value = end
  }
  onGoing.value = dateStart.value.length !== 0 && dateEnd.value?.length === 0
})

const save = () => {
  const dateError = verifyDateFormError(dateStart.value ? dateStart.value : undefined, dateEnd.value ? dateEnd.value : undefined, onGoing.value)
  if (dateError.length > 0) {
    hasFailed.value = true
    errorMessage.value = dateError
    return
  }
  hasFailed.value = false
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
      store.updateProjectName(newName.value)
      dashboardStore.updateProjectObjectives(newObjectives.value)
      dashboardStore.updateProjectSummary(newSummary.value)
    },
    onError: (e) => {
      isSaving.value = false
      hasFailed.value = true
      errorMessage.value = DEFAULT_ERROR_MSG
      console.info(e)
    }
  })
}
</script>
