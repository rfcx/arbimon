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
    <ol class="relative border-l border-box-grey">
      <li class="mb-8 ml-6">
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
      <li class="mb-8 ml-6">
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
      <!-- <li class="mb-8 ml-6">
        <span class="flex absolute -left-3 text-xs justify-center items-center w-6 h-6 bg-steel-grey rounded-full ring-1 ring-box-grey">
          3
        </span>
        <h2 class="mb-4 text-md">
          Review job size
        </h2>
        <span class="text-subtle">1,300 recordings selected</span>
      </li> -->
    </ol>
    <div class="flex flex-row items-center space-x-4">
      <router-link :to="{ name: ROUTE_NAMES.cnnJobList }">
        <button class="btn">
          Cancel
        </button>
      </router-link>
      <button
        :disabled="isLoadingPostJob || errors.length > 0"
        class="btn btn-primary"
        @click.prevent="create"
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
import { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'

import { isDefined } from '@rfcx-bio/utils/predicates'

import ClassifierPicker from '@/_services/picker/classifier-picker.vue'
import DatePicker from '@/_services/picker/date-picker.vue'
import { DateRange } from '@/_services/picker/date-range-picker-interface'
import SitePicker from '@/_services/picker/site-picker.vue'
import TimeOfDayPicker from '@/_services/picker/time-of-day-picker.vue'
import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { useClassifiers } from '../_composables/use-classifiers'
import { usePostClassifierJob } from '../_composables/use-post-classifier-job'

const router = useRouter()
const store = useStore()

// External data
const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingClassifiers, isError: isErrorClassifier, data: classifiers } = useClassifiers(apiClientCore)
const { isLoading: isLoadingPostJob, isError: isErrorPostJob, mutate: mutatePostJob } = usePostClassifierJob(apiClientCore)

// Current projects
const selectedProject = computed(() => store.selectedProject)
const selectedProjectIdCore = computed(() => selectedProject.value?.idCore)
const projectFilters = computed(() => store.projectFilters)
const projectDateRange = computed(() => {
  const dateStartLocalIso = projectFilters.value?.dateStartInclusiveUtc
  const dateEndLocalIso = projectFilters.value?.dateEndInclusiveUtc

  if (!dateStartLocalIso || !dateEndLocalIso) { return undefined }
  return { dateStartLocalIso, dateEndLocalIso }
})

// Fields
const selectedClassifier = ref<number>(-1)
const selectedQueryStreams = ref<string | null>(null) // null = all, 'AR' = filter only AR
const selectedQueryStart = ref<string | null>(null)
const selectedQueryEnd = ref<string | null>(null)
const selectedQueryHours = ref<number[] | null>(null)

// Watches & callbacks
const onSelectClassifier = (value: number) => { selectedClassifier.value = value }
const onSelectQuerySites = (value: string) => { selectedQueryStreams.value = value }
const onSelectQueryDates = ({ dateStartLocalIso, dateEndLocalIso }: DateRange) => {
  selectedQueryStart.value = dateStartLocalIso
  selectedQueryEnd.value = dateEndLocalIso
}
const onSelectQueryHours = (value: number[] | null) => { selectedQueryHours.value = value }

// Validation
const shouldValidate = ref(false)

const errorProject = computed(() => selectedProjectIdCore.value !== '' ? undefined : 'No project selected or project is invalid')
const errorPermission = computed(() => selectedProject.value?.isMyProject ?? false ? undefined : 'You do not have permission to create jobs for this project')
const errorClassifier = computed(() => selectedClassifier.value > 0 ? undefined : 'Please select a classifier')

const errors = computed(() => shouldValidate.value ? [errorProject.value, errorPermission.value, errorClassifier.value].filter(isDefined) : [])

const job = computed(() => selectedProjectIdCore.value
  ? {
    classifier_id: selectedClassifier.value,
    project_id: selectedProjectIdCore.value,
    ...selectedQueryStreams.value && { query_streams: selectedQueryStreams.value },
    ...selectedQueryStart.value && { query_start: selectedQueryStart.value },
    ...selectedQueryEnd.value && { query_end: selectedQueryEnd.value },
    ...selectedQueryHours.value && selectedQueryHours.value.length > 0 && { query_hours: selectedQueryHours.value.join(',') }
  }
  : undefined
)

// Create job (call API)
const create = async (): Promise<void> => {
  // Enable validation on first submit
  shouldValidate.value = true

  // Reject if validation errors
  if (errors.value.length > 0) { return }

  // Reject if invalid project
  if (!job.value) { return }

  // Save
  mutatePostJob(job.value, {
    onSuccess: () => { router.push({ name: ROUTE_NAMES.cnnJobList }) }
  })
}
</script>
