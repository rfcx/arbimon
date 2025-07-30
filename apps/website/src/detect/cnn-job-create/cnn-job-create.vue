<template>
  <section class="pt-20 pl-18 pr-6 md:(pl-23 pr-10) xl:(pl-33 pr-20)">
    <div class="text-frequency">
      <page-title page-title="Create New CNN Job" />
    </div>
    <div v-if="errors.length > 0">
      <span class="my-4 bg-danger-background inline-flex text-echo items-center p-3 border-1 border-rose-600 border-l-3 rounded-lg w-full">
        <icon-custom-ic-error-message />
        {{ errors.join('; ') }}
      </span>
    </div>
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
            <DaterangePicker
              v-if="recordedMinutesPerDay"
              :initial-date-start="projectDateRange.dateStartLocalIso"
              :initial-date-end="projectDateRange.dateEndLocalIso"
              :recorded-minutes-per-day="recordedMinutesPerDay"
              @emit-select-date-range="onSelectQueryDates"
            />
            <span
              v-if="showDateDifferenceError"
              class="flex mt-2 text-sm text-red-800 dark:text-flamingo"
            >
              The maximum date range is 1 year. Please adjust your selection.
            </span>
          </div>
          <div class="mb-3 mt-5 flex flex-col">
            <label
              for="time"
              class="block mb-2 text-base"
            >
              Time of day
            </label>
            <TimeOfDayPicker @emit-hour-range="onSelectQueryHours" />
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
          >{{ displayFullValue(Math.floor(totalDurationInMinutes)) }} minutes of recordings</span>
        </li>
      </ol>
      <div class="flex flex-row items-center space-x-4">
        <router-link :to="{ name: ROUTE_NAMES.cnnJobList }">
          <button
            title="Cancel"
            class="px-3 py-0 btn btn-secondary h-40px w-106px"
          >
            Cancel
          </button>
        </router-link>
        <button
          :disabled="isLoadingPostJob || errors.length > 0 || !store.userIsExpertMember"
          :data-tooltip-target="!store.userIsExpertMember ? 'createJobTooltipId' : null"
          data-tooltip-placement="bottom"
          class="px-3 py-0 btn btn-primary h-40px w-106px disabled:hover:btn-disabled disabled:btn-disabled"
          @click.prevent="createJob"
        >
          <span v-if="isLoadingPostJob">Saving</span>
          <span v-else>Create</span>
        </button>
        <div
          v-if="!store.userIsExpertMember"
          id="createJobTooltipId"
          role="tooltip"
          class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
        >
          {{ disableText }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
        <span v-if="isErrorPostJob">Error saving job :(</span>
      </div>
    </form>
  </section>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { initTooltips } from 'flowbite'
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { CreateClassifierJobBody } from '@rfcx-bio/common/api-bio/cnn/create-classifier-job'
import type { DetectRecordingQueryParams } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import { displayFullValue } from '@rfcx-bio/utils/number'
import { isDefined } from '@rfcx-bio/utils/predicates'
import { isValidQueryHours } from '@rfcx-bio/utils/query-hour'

import { type DateRange } from '@/_components/date-range-picker/date-range-picker'
import DaterangePicker from '@/_components/date-range-picker/date-range-picker.vue'
import ClassifierPicker from '@/_services/picker/classifier-picker.vue'
import SiteInput from '@/_services/picker/site-input.vue'
import TimeOfDayPicker from '@/_services/picker/time-of-day-picker.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { useClassifiers } from '../_composables/use-classifiers'
import { useDetectRecording } from '../_composables/use-detect-recording'
import { useGetRecordedMinutesPerDay } from '../_composables/use-get-recorded-minutes-per-day'
import { usePostClassifierJob } from '../_composables/use-post-classifier-job'

const router = useRouter()
const store = useStore()

const errorText = 'Error - there’s a problem loading the models. Please refresh this page and try again.'
const disableText = 'Contact your project administrator for permission to create a job'
const showDateDifferenceError = ref(false)

// Fields
const job: CreateClassifierJobBody = reactive({
  classifierId: -1,
  projectId: -1,
  queryStreams: undefined,
  queryStart: '',
  queryEnd: '',
  queryHours: '0-23',
  minutesTotal: 0
})

// Current projects
const projectFilters = computed(() => store.projectFilters)
const projectDateRange = computed(() => {
  const dateStartLocalIso = dayjs(projectFilters.value?.dateStartInclusiveUtc).toISOString() ?? dayjs().toISOString()
  const dateEndLocalIso = dayjs(projectFilters.value?.dateEndInclusiveUtc).toISOString() ?? dayjs().toISOString()

  return { dateStartLocalIso, dateEndLocalIso }
})

const recordingQuery: DetectRecordingQueryParams = reactive({
  dateStartLocal: projectDateRange.value.dateStartLocalIso,
  dateEndLocal: projectDateRange.value.dateEndLocalIso,
  querySites: '',
  queryHours: '0-23'
})

const project = reactive({
  projectId: store.project?.id.toString() ?? '-1'
})

const hasProjectPermission = ref(false)

onMounted(() => {
  initTooltips()
  job.projectId = store.project?.id ?? -1
  project.projectId = store.project?.id.toString() ?? '-1'
  hasProjectPermission.value = store.userIsProjectMember
})

watch(() => store.project, () => {
  job.projectId = store.project?.id ?? -1
  project.projectId = store.project?.id.toString() ?? '-1'
  hasProjectPermission.value = store.userIsProjectMember
})

// Internal data
const apiClientBio = inject(apiClientKey) as AxiosInstance
const { isLoading: isLoadingDetectRecording, isError: isErrorDetectRecording, data: recordingData } = useDetectRecording(apiClientBio, project, recordingQuery)
const { data: recordedMinutesPerDay } = useGetRecordedMinutesPerDay(apiClientBio, project.projectId)

// External data
const { isLoading: isLoadingClassifiers, isError: isErrorClassifier, data: classifiers } = useClassifiers(apiClientBio)
const { isPending: isLoadingPostJob, isError: isErrorPostJob, mutate: mutatePostJob } = usePostClassifierJob(apiClientBio)

const checkDateDifference = (dateRange: [string, string]): boolean => {
  const start = new Date(dateRange[0])
  const end = new Date(dateRange[1])

  const differenceInMilliseconds = Math.abs(Number(end) - Number(start))
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365
  const millisecondsInDay = 1000 * 60 * 60 * 24

  return differenceInMilliseconds > (millisecondsInYear + millisecondsInDay)
}

// Set job configuration and set validate to false every time data change
const onSelectClassifier = (classifierId: number) => {
  validated.value = false
  job.classifierId = classifierId
}
const onSelectQuerySites = (queryStreams: string | null) => {
  validated.value = false
  job.queryStreams = queryStreams ?? undefined
  recordingQuery.querySites = queryStreams ?? undefined
}
const onSelectQueryDates = ({ dateStartLocalIso, dateEndLocalIso }: DateRange) => {
  if (project.projectId === '-1') return

  validated.value = false
  job.queryStart = dateStartLocalIso
  job.queryEnd = dateEndLocalIso
  recordingQuery.dateStartLocal = dateStartLocalIso
  recordingQuery.dateEndLocal = dateEndLocalIso
  showDateDifferenceError.value = checkDateDifference([dateStartLocalIso, dateEndLocalIso])
}

const onSelectQueryHours = (queryHours: string) => {
  validated.value = false
  job.queryHours = queryHours
  recordingQuery.queryHours = queryHours
}

// Validation
const validated = ref(false)

const errorProject = computed(() => job.projectId !== undefined && job.projectId !== -1 ? undefined : 'No project selected or project is invalid')
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
  mutatePostJob({ ...job, minutesTotal: totalDurationInMinutes.value }, {
    onSuccess: async () => {
      router.push({ name: ROUTE_NAMES.cnnJobList })
    }
  })
}

</script>
