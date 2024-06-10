<template>
  <section class="bg-white dark:bg-pitch pl-18 mx-auto py-10">
    <div
      v-if="isErrorSetting"
      class="max-w-screen-xl flex items-center justify-center h-screen text-center"
    >
      <span>
        It seems the page didn’t load as expected.<br>
        Please refresh your browser to give it another go.
      </span>
    </div>
    <div
      v-else
      class="py-10 mx-auto max-w-screen-xl flex flex-col gap-y-6 pr-4"
    >
      <h1 class="text-gray-900 dark:text-insight">
        Project settings
      </h1>
      <ReadOnlyBanner v-if="!store.userIsAdminProjectMember" />
      <div
        class="flex flex-row-reverse items-center gap-4"
      >
        <button
          :disabled="isSaving || !store.userIsAdminProjectMember"
          class="inline-flex items-center py-2 px-14 btn btn-primary disabled:hover:btn-disabled disabled:btn-disabled"
          :data-tooltip-target="!store.userIsAdminProjectMember ? 'projectSettingsSaveTooltipId': null"
          data-tooltip-placement="bottom"
          @click.prevent="save"
        >
          Save
        </button>
        <div
          v-if="!store.userIsAdminProjectMember"
          id="projectSettingsSaveTooltipId"
          role="tooltip"
          class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
        >
          {{ disableText }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <div
          v-if="isSaving"
          class="inline-flex"
        >
          <icon-custom-ic-loading class="animate-spin" />
          <span class="ml-2">
            Saving...
          </span>
        </div>
        <SaveStatusText
          v-if="showStatus && !isSaving"
          class="flex p-4"
          :success="!hasFailed"
          :error-message="errorMessage"
        />
      </div>
      <div class="grid gap-10">
        <div>
          <h4>
            Project information
          </h4>
          <project-form
            :existing-name="selectedProject?.name"
            :date-start="settings?.dateStart ? settings?.dateStart.toString() : undefined"
            :date-end="settings?.dateEnd ? settings?.dateEnd.toString() : undefined"
            :is-disabled="!store.userIsAdminProjectMember"
            @emit-update-value="onEmitDefaultValue"
          />
          <project-summary-form
            :existing-summary="settings?.summary"
            :is-disabled="!store.userIsAdminProjectMember"
            @emit-project-summary="onEmitSummary"
          />
          <project-objective-form
            :existing-objectives="settings?.objectives"
            :is-disabled="!store.userIsAdminProjectMember"
            @emit-project-objectives="onEmitObjectives"
          />
        </div>
        <div>
          <h4>
            Insights
          </h4>
          <project-slug
            :existing-slug="selectedProject?.slug"
            :is-disabled="!store.userIsAdminProjectMember"
            @emit-updated-slug="onEmitSlug"
          />
          <hr class="border-util-gray-03 my-6">
          <project-image-form
            :is-disabled="!store.userIsAdminProjectMember"
            :image="settings?.image !== undefined ? urlWrapper(settings?.image) : undefined"
            @emit-project-image="onEmitProjectImage"
          />
          <hr class="border-util-gray-03 my-6">
          <project-listed-form
            :is-public="settings?.isPublic"
            :is-disabled="!store.userIsAdminProjectMember || settings?.isPublished"
            :is-create-project="false"
            @emit-project-listed="toggleListedProject"
          />
          <template v-if="isToggledForBackup && store.userIsAdminProjectMember">
            <hr class="border-util-gray-03 my-6">
            <project-backup />
          </template>
          <hr class="border-util-gray-03 my-6">
          <project-delete
            v-if="store.project?.role === 'owner'"
            :is-deleting="isDeletingProject"
            :is-error="isErrorDeleteProject"
            :is-success="isSuccessDeleteProject"
            @emit-project-delete="onEmitProjectDelete"
          />
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { type AxiosError, type AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { type ProjectProfileUpdateBody, ERROR_MESSAGE_UPDATE_PROJECT_SLUG_NOT_UNIQUE } from '@rfcx-bio/common/api-bio/project/project-settings'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { isValidSlug } from '@rfcx-bio/utils/string/slug'

import SaveStatusText from '@/_components/save-status-text.vue'
import ReadOnlyBanner from '@/_layout/components/guest-banner/guest-banner.vue'
import { urlWrapper } from '@/_services/images/url-wrapper'
import { apiClientKey, togglesKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useStore } from '~/store'
import { useDeleteProject, useGetProjectSettings, useUpdateProjectImage, useUpdateProjectSettings } from './_composables/use-project-profile'
import { verifyDateFormError } from './components/form/functions'
import ProjectDelete from './components/form/project-delete.vue'
import ProjectForm from './components/form/project-form.vue'
import ProjectImageForm from './components/form/project-image-form.vue'
import ProjectListedForm from './components/form/project-listed-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import ProjectSlug from './components/form/project-slug.vue'
import ProjectSummaryForm from './components/form/project-summary-form.vue'
import ProjectBackup from './components/project-backup/project-backup.vue'
import type { ProjectDefault } from './types'

const router = useRouter()
const store = useStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const toggles = inject(togglesKey)
const selectedProject = computed(() => store.project)
const selectedProjectId = computed(() => store.project?.id)

const { data: settings, isError: isErrorSetting } = useGetProjectSettings(apiClientBio, selectedProjectId)
const { mutate: mutateProjectSettings } = useUpdateProjectSettings(apiClientBio, store.project?.id ?? -1)
const { mutate: mutatePatchProfilePhoto } = useUpdateProjectImage(apiClientBio, store.project?.id ?? -1)
const { isPending: isDeletingProject, isError: isErrorDeleteProject, isSuccess: isSuccessDeleteProject, mutate: mutateDeleteProject } = useDeleteProject(apiClientBio)

const newName = ref('')
const dateStart = ref<string | null>(null)
const dateEnd = ref<string | null>(null)
const onGoing = ref(false)
const newSummary = ref('')
const newSlug = ref<string | null>(null)
const newObjectives = ref<string[]>()
const isSaving = ref(false)
const DEFAULT_ERROR_MSG = 'Failed!'
const profileImageForm = ref()
const uploadedFile = ref()
const isPublic = ref<boolean>(true)
const disableText = ref('Contact your project administrator for permission to edit project settings')

const showStatus = ref(false)
const hasFailed = ref(false)
const errorMessage = ref<string | undefined>('A Server Error Occurred. We encountered some issues while saving your changes. Could you please try again?')

const date = Math.floor(Date.now() / 1000)

const lastModified = ref<number>(date)
const lastSaved = ref<number>(date)

const isToggledForBackup = computed(() => {
  const isInternalUser = store.user?.email?.includes('rfcx.org') ?? false
  return toggles?.projectBackup === true || isInternalUser
})

// update form values
const onEmitDefaultValue = (value: ProjectDefault) => {
  newName.value = value.name
  dateStart.value = value.startDate
  dateEnd.value = value.endDate
  onGoing.value = value.onGoing
  updateLastModified()
}

const onEmitSummary = (value: string) => {
  newSummary.value = value
  updateLastModified()
}

const onEmitObjectives = (value: string[]) => {
  newObjectives.value = value
  updateLastModified()
}

const onEmitProjectImage = (file: File) => {
  const name = file.name
  const type = file.type
  const readerBuffer = new FileReader()
  readerBuffer.addEventListener('load', e => {
    uploadedFile.value = e.target?.result
    const imageFileAsBlobType = new File([new Blob([uploadedFile.value as BlobPart])], name, {
      type
    })
    const form = new FormData()
    form.append('image', imageFileAsBlobType, name)
    console.info(form.getAll('image'))
    profileImageForm.value = form
  })
  readerBuffer.readAsArrayBuffer(file)
  updateLastModified()
}

const onEmitSlug = (slug: string) => {
  newSlug.value = slug
  updateLastModified()
}

const onEmitProjectDelete = () => {
  mutateDeleteProject(store.project?.id ?? -1, {
    onSuccess: async () => {
      store.deleteProject(store.project?.id)
      await router.push({ name: ROUTE_NAMES.myProjects })
    }
  })
}

const toggleListedProject = (value: boolean) => {
  isPublic.value = value
}

watch(() => selectedProject.value, () => {
  if (selectedProject.value === undefined) return
  newName.value = selectedProject.value.name
})

watch(() => settings.value, () => {
  if (!settings.value) return
  newName.value = settings.value.name
  newSummary.value = settings.value.summary
  newObjectives.value = settings.value.objectives
  isPublic.value = settings.value.isPublic

  if (settings.value.dateStart !== null) {
    dateStart.value = dayjs(settings.value.dateStart).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  }

  if (settings.value.dateEnd !== null) {
    dateEnd.value = dayjs(settings.value.dateEnd).format('YYYY-MM-DD') + 'T00:00:00.000Z'
  }

  onGoing.value = dateStart.value?.length !== 0 && dateEnd.value?.length === 0
})

const displayTextAfterSaveWithSuccessStatus = (success: boolean, errorMsg?: string) => {
  showStatus.value = true
  hasFailed.value = !success
  errorMessage.value = errorMsg
}

const save = () => {
  const dateError = verifyDateFormError(dateStart.value ? dateStart.value : undefined, dateEnd.value ? dateEnd.value : undefined, onGoing.value)
  if (dateError.length > 0) {
    displayTextAfterSaveWithSuccessStatus(false, dateError)
    return
  }
  if (!isValidSlug(newSlug.value ?? '')) {
    displayTextAfterSaveWithSuccessStatus(false, 'Invalid URL Format. Please ensure the URL contains only lowercase letters, numbers, and dashes (-).')
    return
  }

  if (newObjectives.value === undefined || newObjectives.value.length === 0) {
    displayTextAfterSaveWithSuccessStatus(false, 'Please select at least one project objective to continue.')
    return
  }

  if (!newName.value) {
    displayTextAfterSaveWithSuccessStatus(false, 'Please enter a project name to continue.')
    return
  }

  hasFailed.value = false
  isSaving.value = true
  updateSettings()
}

const updateSettings = () => {
  const update: ProjectProfileUpdateBody = {
    name: newName.value,
    objectives: newObjectives.value,
    dateStart: dateStart.value ? dateStart.value : null,
    dateEnd: onGoing.value ? null : dateEnd.value ? dateEnd.value : null
  }
  if (isPublic.value !== settings.value?.isPublic) {
    update.hidden = !isPublic.value
  }
  if (newSummary.value !== settings.value?.summary) {
    update.summary = newSummary.value
  }
  if (newSlug.value !== settings.value?.slug && newSlug.value !== null) {
    update.slug = newSlug.value
  }

  mutateProjectSettings(update, {
    onSuccess: () => {
      if (profileImageForm.value === undefined) {
        isSaving.value = false
        updateLastSaved()
        displayTextAfterSaveWithSuccessStatus(true)
      }
      store.updateProjectName(newName.value)
      dashboardStore.updateProjectObjectives(newObjectives.value ?? [''])
      dashboardStore.updateProjectSummary(newSummary.value)
      if (newSlug.value !== null) {
        store.updateProjectSlug(newSlug.value)
        // refresh the page to reflect the new slug
        router.push({ path: `/p/${newSlug.value}/settings` })
      }
    },
    onError: (e) => {
      isSaving.value = false
      displayTextAfterSaveWithSuccessStatus(false, DEFAULT_ERROR_MSG)

      const error = e as AxiosError<Error>
      if (error.response?.data !== undefined && error.response.data.message === ERROR_MESSAGE_UPDATE_PROJECT_SLUG_NOT_UNIQUE) {
        errorMessage.value = 'Duplicate URL Detected.' + ' Each project URL must be unique. Please enter a different URL to proceed.'
      }
    }
  })
  if (profileImageForm.value !== undefined) {
    mutatePatchProfilePhoto(profileImageForm.value, {
      onSuccess: async () => {
        isSaving.value = false
        updateLastSaved()
        displayTextAfterSaveWithSuccessStatus(true)
      },
      onError: () => {
        isSaving.value = false
        displayTextAfterSaveWithSuccessStatus(false, 'The photo upload was failed to upload.')
      }
    })
  }
}

const updateLastModified = () => {
  lastModified.value = Math.floor(Date.now() / 1000)
}

const updateLastSaved = () => {
  lastSaved.value = Math.floor(Date.now() / 1000)
}

onBeforeRouteLeave(() => {
  if (lastModified.value > lastSaved.value) {
    const answer = window.confirm('Are you sure you want to leave the page? You have unsaved changes.')
    return answer
  }
  return true
})

</script>
