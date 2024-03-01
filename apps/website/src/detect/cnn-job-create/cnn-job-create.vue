<template>
  <section class="max-w-screen-xl py-20 pl-115px pr-4">
    <div class="text-frequency">
      <page-title page-title="Create New CNN Job" />
    </div>
    <el-alert
      v-if="errors.length > 0"
      :title="errors.join('; ')"
      type="warning"
      class="my-4"
      effect="dark"
      show-icon
    />
    <form class="mt-5">
      <ol class="relative border-white">
        <li class="border-l-1 border-white pb-8 pl-6">
          <span class="flex absolute -left-3 text-xl justify-center items-center w-6 h-6 bg-pitch rounded-full ring-1 ring-white">
            1
          </span>
          <h6 class="mb-4 text-xl">
            Choose Model
          </h6>
          <div
            v-if="isLoadingClassifiers"
            class="loading-shimmer h-9 mt-2"
          />
          <span
            v-else-if="isErrorClassifier"
            class="text-base"
          >
            {{ errorText }}
          </span>
          <span
            v-else-if="classifiers === undefined"
            class="text-base"
          >
            😔 Content not available
          </span>
          <classifier-picker
            v-else
            :classifier-models="classifiers"
            @selected-classifier="onSelectClassifier"
          />
        </li>
        <li class="border-l-1 border-white pb-8 pl-6">
          <span class="flex absolute -left-3 text-xl justify-center items-center w-6 h-6 bg-pitch rounded-full ring-1 ring-white">
            2
          </span>
          <h6 class="mb-4 text-xl">
            Choose Parameters
          </h6>
          <div class="mb-3">
            <label
              for="sites"
              class="block mb-2 text-base"
            >
              Sites
            </label>
            <site-input
              class="mt-2"
              :initial-sites="projectFilters?.locationSites"
              @emit-select-sites="onSelectQuerySites"
            />
          </div>
          <div class="mb-3 mt-5">
            <label
              for="date"
              class="block mb-2 text-base"
            >
              Date
            </label>
            <date-picker
              :initial-dates="projectDateRange"
              @emit-select-date-range="onSelectQueryDates"
            />
          </div>
          <div class="mb-3 mt-5">
            <label
              for="time"
              class="block mb-2 text-base"
            >
              Time of day
            </label>
            <TimeOfDayPicker @emit-select-time="onSelectQueryHours" />
          </div>
        </li>
        <li class="pb-8 pl-6">
          <span class="flex absolute -left-3 text-xl justify-center items-center w-6 h-6 bg-pitch rounded-full ring-1 ring-white">
            3
          </span>
          <h6 class="mb-4 text-xl">
            Job size estimation
          </h6>
          <span v-if="isLoadingDetectRecording">Loading</span>
          <span v-else-if="isErrorDetectRecording">Error</span>
          <span v-else-if="recordingData === undefined">😔 Content not available</span>
          <span
            v-else
            class="text-base"
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
  </section>
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
import SiteInput from '@/_services/picker/site-input.vue'
import TimeOfDayPicker from '@/_services/picker/time-of-day-picker.vue'
import { apiClientCoreKey, apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useProjectUserPermissionsStore, useStore } from '~/store'
import { useClassifiers } from '../_composables/use-classifiers'
import { useDetectRecording } from '../_composables/use-detect-recording'
import { usePostClassifierJob } from '../_composables/use-post-classifier-job'

const router = useRouter()
const store = useStore()
const projectUserPermissionsStore = useProjectUserPermissionsStore()

const errorText = 'Error - there’s a problem loading the models. Please refresh this page and try again.'

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

const selectedTime = reactive({
  selectedTimeType: 'All day',
  selectedHourRange: '0-23',
  selectedHourRangeLabel: '00:00-23:00'
})

const hasProjectPermission = ref(false)

onMounted(() => {
  onSelectQueryHours(selectedTime.selectedHourRange)
  job.projectIdCore = store.selectedProject?.idCore ?? null
  project.projectId = store.selectedProject?.id.toString() ?? '-1'
  hasProjectPermission.value = projectUserPermissionsStore.isMember
})

watch(() => store.selectedProject, () => {
  job.projectIdCore = store.selectedProject?.idCore ?? null
  project.projectId = store.selectedProject?.id.toString() ?? '-1'
  hasProjectPermission.value = projectUserPermissionsStore.isMember
})

// Internal data
const apiClientBio = inject(apiClientKey) as AxiosInstance
const { isLoading: isLoadingDetectRecording, isError: isErrorDetectRecording, data: recordingData } = useDetectRecording(apiClientBio, project, recordingQuery)

// External data
const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingClassifiers, isError: isErrorClassifier, data: classifiers } = useClassifiers(apiClientCore)
const { isPending: isLoadingPostJob, isError: isErrorPostJob, mutate: mutatePostJob } = usePostClassifierJob(apiClientCore)

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
