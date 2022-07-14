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
        <button
          title="Cancel"
          class="btn"
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
import { AxiosInstance } from 'axios'
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { ClassifierJobCreateConfiguration } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'
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

// Fields
const job: ClassifierJobCreateConfiguration = reactive({
  classifierId: -1,
  projectIdCore: null,
  queryStreams: null,
  queryStart: null,
  queryEnd: null,
  queryHour: null
})

const hasProjectPermission = ref(false)

onMounted(() => {
  job.projectIdCore = store.selectedProject?.idCore ?? null
  hasProjectPermission.value = store.selectedProject?.isMyProject ?? false
})

watch(() => store.selectedProject, () => {
  job.projectIdCore = store.selectedProject?.idCore ?? null
  hasProjectPermission.value = store.selectedProject?.isMyProject ?? false
})

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
const onSelectQuerySites = (queryStreams: string) => {
  validated.value = false
  job.queryStreams = queryStreams
}
const onSelectQueryDates = ({ dateStartLocalIso, dateEndLocalIso }: DateRange) => {
  validated.value = false
  job.queryStart = dateStartLocalIso
  job.queryEnd = dateEndLocalIso
}
const onSelectQueryHours = (queryHour: string) => {
  validated.value = false
  job.queryHour = queryHour
}

// Validation
const validated = ref(false)

const errorProject = computed(() => job.projectIdCore !== null && job.projectIdCore !== '' ? undefined : 'No project selected or project is invalid')
const errorPermission = computed(() => hasProjectPermission.value ? undefined : 'You do not have permission to create jobs for this project')
const errorClassifier = computed(() => job.classifierId > 0 ? undefined : 'Please select a classifier')
const errorHours = computed(() => /^((\b([0-9]|1[0-9]|2[0-3])\b(-\b([0-9]|1[0-9]|2[0-3])\b)?)(,)?)+$/g.test(job.queryHour ?? '') ? undefined : 'Time of day must be in range of 0 - 23 following by , or - to split hours')

const errors = computed(() => validated.value ? [errorProject.value, errorPermission.value, errorClassifier.value, errorHours.value].filter(isDefined) : [])

// Create job (call API)
const createJob = async (): Promise<void> => {
  // Enable validation on first submit
  validated.value = true

  // Reject if validation errors
  if (errors.value.length > 0) { return }

  // Save
  mutatePostJob(job, {
    onSuccess: () => router.push({ name: ROUTE_NAMES.cnnJobList })
  })
}

</script>
