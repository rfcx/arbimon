<template>
  <section class="bg-white dark:bg-pitch pl-18">
    <div class="py-10 mx-auto max-w-screen-xl flex flex-col gap-y-6 pr-4">
      <h1 class="text-gray-900 dark:text-insight">
        Project settings
      </h1>
      <GuestBanner v-if="isViewingAsGuest" />
      <div class="grid lg:(grid-cols-2 gap-10)">
        <div>
          <h5>
            Project information
          </h5>
          <project-form
            :existing-name="selectedProject?.name"
            :date-start="settings?.dateStart"
            :date-end="settings?.dateEnd"
            :is-disabled="!isUserHasFullAccess"
            @emit-update-value="onEmitDefaultValue"
          />
          <project-summary-form
            :existing-summary="settings?.summary"
            :is-disabled="!isUserHasFullAccess"
            @emit-project-summary="onEmitSummary"
          />
          <project-objective-form
            :existing-objectives="settings?.objectives"
            :is-disabled="!isUserHasFullAccess"
            @emit-project-objectives="onEmitObjectives"
          />
        </div>
        <div>
          <h5>
            Insights
          </h5>
          <project-slug
            :existing-slug="selectedProject?.slug"
            :is-disabled="!isUserHasFullAccess"
            @emit-updated-slug="onEmitSlug"
          />
          <div class="my-6 h-[1px] w-full bg-util-gray-01" />
          <project-image-form
            :is-disabled="!isUserHasFullAccess"
            :image="settings?.image !== undefined ? urlWrapper(settings?.image) : undefined"
            @emit-project-image="onEmitProjectImage"
          />
          <div class="my-6 h-[1px] w-full bg-util-gray-01" />
          <project-listed-form
            :is-public="settings?.isPublic"
            :is-disabled="!isUserHasFullAccess || settings?.isPublished"
            :is-create-project="false"
            @emit-project-listed="toggleListedProject"
          />
          <div class="my-6 h-[1px] w-full bg-util-gray-01" />
          <project-delete
            v-if="projectUserPermissionsStore.role === 'owner'"
            :is-deleting="isDeletingProject"
            :is-error="isErrorDeleteProject"
            :is-success="isSuccessDeleteProject"
            @emit-project-delete="onEmitProjectDelete"
          />
        </div>
      </div>
      <div
        v-if="isProjectMember && !isViewingAsGuest"
        class="flex flex-row-reverse items-center gap-4"
      >
        <button
          :disabled="isSaving || !isUserHasFullAccess"
          class="self-end inline-flex items-center py-2 px-14 btn btn-primary disabled:hover:btn-disabled disabled:btn-disabled"
          data-tooltip-target="projectSettingsSaveTooltipId"
          data-tooltip-placement="bottom"
          @click.prevent="save"
        >
          Save changes
        </button>
        <div
          v-if="!isUserHasFullAccess"
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
          <svg
            class="w-4 h-4 ml-1"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 20.292969 5.2929688 L 9 16.585938 L 4.7070312 12.292969 L 3.2929688 13.707031 L 9 19.414062 L 21.707031 6.7070312 L 20.292969 5.2929688 z" />
          </svg>
          <span class="font-medium ml-2 mt-0.15rem">{{ lastUpdatedText }}</span>
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
import { useRoute, useRouter } from 'vue-router'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import GuestBanner from '@/_layout/components//guest-banner/guest-banner.vue'
import { urlWrapper } from '@/_services/images/url-wrapper'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useDashboardStore, useProjectUserPermissionsStore, useStore } from '~/store'
import { useDeleteProject, useGetProjectSettings, useUpdateProjectImage, useUpdateProjectSettings } from './_composables/use-project-profile'
import { verifyDateFormError } from './components/form/functions'
import ProjectDelete from './components/form/project-delete.vue'
import ProjectForm from './components/form/project-form.vue'
import ProjectImageForm from './components/form/project-image-form.vue'
import ProjectListedForm from './components/form/project-listed-form.vue'
import ProjectObjectiveForm from './components/form/project-objective-form.vue'
import ProjectSlug from './components/form/project-slug.vue'
import ProjectSummaryForm from './components/form/project-summary-form.vue'
import type { ProjectDefault } from './types'

const router = useRouter()
const route = useRoute()
const store = useStore()
const projectUserPermissionsStore = useProjectUserPermissionsStore()
const dashboardStore = useDashboardStore()
const apiClientBio = inject(apiClientKey) as AxiosInstance
const selectedProject = computed(() => store.selectedProject)
const selectedProjectId = computed(() => store.selectedProject?.id)
const isProjectMember = computed(() => store.selectedProject?.isMyProject ?? false)
const isViewingAsGuest = computed(() => {
  return route.query.guest === '1' || projectUserPermissionsStore.isMemberGuest
})

const { data: settings } = useGetProjectSettings(apiClientBio, selectedProjectId)
const { mutate: mutateProjectSettings } = useUpdateProjectSettings(apiClientBio, store.selectedProject?.id ?? -1)
const { mutate: mutatePatchProfilePhoto } = useUpdateProjectImage(apiClientBio, store.selectedProject?.id ?? -1)
const { isPending: isDeletingProject, isError: isErrorDeleteProject, isSuccess: isSuccessDeleteProject, mutate: mutateDeleteProject } = useDeleteProject(apiClientBio)

const newName = ref('')
const dateStart = ref<string | null>(null)
const dateEnd = ref<string | null>(null)
const onGoing = ref(false)
const newSummary = ref('')
const newSlug = ref<string | null>(null)
const newObjectives = ref([''])
const isSaving = ref(false)
const DEFAULT_ERROR_MSG = 'Failed!'
const hasFailed = ref(false)
const lastUpdated = ref(false)
const errorMessage = ref<string>(DEFAULT_ERROR_MSG)
const lastUpdatedText = ref<string>()
const profileImageForm = ref()
const uploadedFile = ref()
const isPublic = ref<boolean>(true)
const disableText = ref('Contact your project administrator for permission to edit project settings')

const isUserHasFullAccess = computed<boolean>(() => {
  return projectUserPermissionsStore.role === 'admin' || projectUserPermissionsStore.role === 'owner'
})

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
}

const onEmitSlug = (slug: string) => {
  newSlug.value = slug
}

const onEmitProjectDelete = () => {
  mutateDeleteProject(store.selectedProject?.id ?? -1, {
    onSuccess: async () => {
      await router.push({ name: ROUTE_NAMES.myProjects })
    }
  })
}

const toggleListedProject = (value: boolean) => {
  isPublic.value = value
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
  isPublic.value = settings.value.isPublic

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
    dateEnd: onGoing.value ? null : dateEnd.value ? dateEnd.value : null,
    isPublic: isPublic.value,
    slug: newSlug.value !== null ? newSlug.value : undefined
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
  if (profileImageForm.value !== undefined) {
    mutatePatchProfilePhoto(profileImageForm.value, {
      onSuccess: async () => { }
    })
  }
}

</script>
