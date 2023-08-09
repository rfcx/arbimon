<template>
  <page-title page-title="Create New CNN Job" />
  <el-alert
    v-if="errors.length > 0"
    :title="errors.join('; ')"
    type="warning"
    class="my-4"
    effect="dark"
    show-icon
  />
  <form class="mt-5">
    <ol class="relative border-box-grey">
      <li class="border-l-1 border-box-grey pb-8 pl-6">
        <span class="flex absolute -left-3 text-xs justify-center items-center w-6 h-6 bg-steel-grey rounded-full ring-1 ring-box-grey">
          1
        </span>
        <h2 class="mb-4 text-md">
          Choose Model
        </h2>
        <span v-if="isLoadingClassifiers">Loading</span>
        <span v-else-if="isErrorClassifier">Error</span>
        <span v-else-if="classifiers === undefined">No response</span>
        <classifier-picker
          v-else
          :classifier-models="classifiers"
          @selected-classifier="onSelectClassifier"
        />
      </li>
      <li class="border-l-1 border-box-grey pb-8 pl-6">
        <span class="flex absolute -left-3 text-xs justify-center items-center w-6 h-6 bg-steel-grey rounded-full ring-1 ring-box-grey">
          2
        </span>
        <h2 class="mb-4 text-md">
          Choose Parameters
        </h2>
        <div class="mb-4">
          <label
            for="sites"
            class="block mb-2 text-md"
          >
            Sites
          </label>
          <site-picker
            :initial-sites="projectFilters?.locationSites"
            @emit-select-sites="onSelectQuerySites"
          />
        </div>
        <div class="mb-4">
          <label
            for="date"
            class="block mb-2 text-sm"
          >
            Date
          </label>
          <date-picker
            :initial-dates="projectDateRange"
            @emit-select-date-range="onSelectQueryDates"
          />
        </div>
        <div class="mb-4">
          <label
            for="time"
            class="block mb-2 text-md"
          >
            Time of day
          </label>
          <TimeOfDayPicker @emit-select-time="onSelectQueryHours" />
        </div>
      </li>
      <li class="pb-8 pl-6">
        <span class="flex absolute -left-3 text-xs justify-center items-center w-6 h-6 bg-steel-grey rounded-full ring-1 ring-box-grey">
          3
        </span>
        <h2 class="mb-4 text-md">
          Job size estimation
        </h2>
        <span v-if="isLoadingDetectRecording">Loading</span>
        <span v-else-if="isErrorDetectRecording">Error</span>
        <span v-else-if="recordingData === undefined">No response</span>
        <span
          v-else
          class="text-subtle"
        >{{ totalDurationInMinutes }} minutes of recordings</span>
      </li>
    </ol>
    <div class="flex flex-row items-center space-x-4">
      <router-link :to="{ name: ROUTE_NAMES.cnnJobList }">
        <button
          title="Cancel"
          class="btn btn-secondary"
        >
          Cancel
        </button>
      </router-link>
      <button
        :disabled="isLoadingPostJob || errors.length > 0"
        title="Create"
        class="btn btn-primary"
        @click.prevent="createJob"
      >
        <span v-if="isLoadingPostJob">Saving</span>
        <span v-else>Create</span>
      </button>
      <span v-if="isErrorPostJob">Error saving job :(</span>
    </div>
  </form>
  <el-alert
    v-if="false"
    title="Debugging"
    type="info"
    class="my-4"
    effect="dark"
    show-icon
  >
    <pre>{{ JSON.stringify(job, null, 2).replace(/, /g, ',\r\n  ') }}</pre>
  </el-alert>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { DetectRecordingQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import type { ClassifierJobCreateConfiguration } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'
import { apiCorePostClassifierJobUpdateStatus } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-update-status'
import { isDefined } from '@rfcx-bio/utils/predicates'
import { isValidQueryHours } from '@rfcx-bio/utils/query-hour'

import ClassifierPicker from '@/_services/picker/classifier-picker.vue'
import DatePicker from '@/_services/picker/date-picker.vue'
import type { DateRange } from '@/_services/picker/date-range-picker-interface'
import SitePicker from '@/_services/picker/site-picker.vue'
import TimeOfDayPicker from '@/_services/picker/time-of-day-picker.vue'
import { apiClientBioKey, apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { useClassifiers } from '../_composables/use-classifiers'
import { useDetectRecording } from '../_composables/use-detect-recording'
import { usePostClassifierJob } from '../_composables/use-post-classifier-job'

const router = useRouter()
const store = useStore()

// Fields
const job: ClassifierJobCreateConfiguration = reactive({
  classifierId: -1,
  projectIdCore: null,
  queryStreams: null,
  queryStart: null,
  queryEnd: null,
  queryHours: null
})

const recordingQuery: DetectRecordingQueryParams = reactive({
  dateStartLocal: '',
  dateEndLocal: '',
  querySites: '',
  queryHours: ''
})

const project = reactive({
  projectId: '-1'
})

const hasProjectPermission = ref(false)

onMounted(() => {
  job.projectIdCore = store.selectedProject?.idCore ?? null
  project.projectId = store.selectedProject?.id.toString() ?? '-1'
  hasProjectPermission.value = store.selectedProject?.isMyProject ?? false
})

watch(() => store.selectedProject, () => {
  job.projectIdCore = store.selectedProject?.idCore ?? null
  project.projectId = store.selectedProject?.id.toString() ?? '-1'
  hasProjectPermission.value = store.selectedProject?.isMyProject ?? false
})

// Internal data
const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const { isLoading: isLoadingDetectRecording, isError: isErrorDetectRecording, data: recordingData } = useDetectRecording(apiClientBio, project, recordingQuery)

// External data
const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingClassifiers, isError: isErrorClassifier, data: classifiers } = useClassifiers(apiClientCore)
const { isLoading: isLoadingPostJob, isError: isErrorPostJob, mutate: mutatePostJob } = usePostClassifierJob(apiClientCore)

// Current projects
const projectFilters = computed(() => store.projectFilters)
const projectDateRange = computed(() => {
  const dateStartLocalIso = projectFilters.value?.dateStartInclusiveUtc
  const dateEndLocalIso = projectFilters.value?.dateEndInclusiveUtc

  if (!dateStartLocalIso || !dateEndLocalIso) { return undefined }
  return { dateStartLocalIso, dateEndLocalIso }
})

// Set job configuration and set validate to false every time data change
const onSelectClassifier = (classifierId: number) => {
  validated.value = false
  job.classifierId = classifierId
}
const onSelectQuerySites = (queryStreams: string | null) => {
  validated.value = false
  job.queryStreams = queryStreams
  recordingQuery.querySites = queryStreams ?? undefined
}
const onSelectQueryDates = ({ dateStartLocalIso, dateEndLocalIso }: DateRange) => {
  validated.value = false
  job.queryStart = dateStartLocalIso
  job.queryEnd = dateEndLocalIso
  recordingQuery.dateStartLocal = dateStartLocalIso
  recordingQuery.dateEndLocal = dateEndLocalIso
}
const onSelectQueryHours = (queryHours: string) => {
  validated.value = false
  job.queryHours = queryHours
  recordingQuery.queryHours = queryHours
}

// Validation
const validated = ref(false)

const errorProject = computed(() => job.projectIdCore !== null && job.projectIdCore !== '' ? undefined : 'No project selected or project is invalid')
const errorPermission = computed(() => hasProjectPermission.value ? undefined : 'You do not have permission to create jobs for this project')
const errorClassifier = computed(() => job.classifierId > 0 ? undefined : 'Please select a classifier')
const errorHours = computed(() => isValidQueryHours(job.queryHours ?? '') ? undefined : 'Time of day must be in range of 0 - 23 following by , or - to split hours')

const errors = computed(() => validated.value ? [errorProject.value, errorPermission.value, errorClassifier.value, errorHours.value].filter(isDefined) : [])

const totalDurationInMinutes = computed(() => {
  return recordingData.value?.totalDurationInMinutes ?? 0
})

// Create job (call API)
const createJob = async (): Promise<void> => {
  // Enable validation on first submit
  validated.value = true

  // Reject if validation errors
  if (errors.value.length > 0) { return }

  // Save
  mutatePostJob(job, {
    onSuccess: async (response) => {
      await apiCorePostClassifierJobUpdateStatus(apiClientCore, response.jobId, { minutes_total: totalDurationInMinutes.value })
      router.push({ name: ROUTE_NAMES.cnnJobList })
    }
  })
}

</script>
