<template>
  <page-title page-title="Create New CNN Job" />
  <el-alert
    v-if="errors.length > 0"
    :title="errors.join('; ')"
    type="warning"
    class="my-4"
    effect="dark"
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
          :classifier-models="classifiers ?? []"
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
          <site-picker @emit-select-site="onSelectSites" />
        </div>
        <div class="mb-4">
          <label
            for="date"
            class="block mb-2 text-sm"
          >
            Date
          </label>
          <div
            date-rangepicker
            class="flex items-center"
          >
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-500 "
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                /></svg>
              </div>
              <input
                name="start"
                type="text"
                class="bg-mirage-grey text-white border border-box-gray sm:text-sm rounded-lg block w-full pl-10 p-2.5"
                placeholder="Select date start"
              >
            </div>
            <span class="mx-4">to</span>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clip-rule="evenodd"
                /></svg>
              </div>
              <input
                name="end"
                type="text"
                class="bg-mirage-grey text-white border border-box-gray  sm:text-sm rounded-lg block w-full pl-10 p-2.5"
                placeholder="Select date end"
              >
            </div>
          </div>
        </div>
        <div class="mb-4">
          <label
            for="time"
            class="block mb-2 text-md"
          >
            Time of day
          </label>
          <TimeOfDayPicker @emit-select-time="onSelectTime" />
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
        Create
      </button>
      <span v-if="isLoadingPostJob">Saving...</span>
      <span v-if="isErrorPostJob">Error :(</span>
    </div>
  </form>
</template>
<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { Dayjs } from 'dayjs'
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'

import { isDefined } from '@rfcx-bio/utils/predicates'

import ClassifierPicker from '@/_services/picker/classifier-picker.vue'
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

const selectedProject = computed(() => store.selectedProject)
const selectedProjectIdCore = computed(() => selectedProject.value?.idCore)

// Fields
const selectedClassifier = ref<number>(-1)
const selectedQueryStreams = ref<string | null>(null) // null = all, 'AR' = filter only AR
const selectedQueryStart = ref<Dayjs | null>(null)
const selectedQueryEnd = ref<Dayjs | null>(null)
const selectedQueryHours = ref<number[] | null>(null)

// Watches & callbacks
const onSelectClassifier = (value: number) => { selectedClassifier.value = value }
const onSelectSites = (value: string) => { selectedQueryStreams.value = value }
const onSelectTime = (timeRange: number[]) => { selectedQueryHours.value = timeRange }

// Validation
const shouldValidate = ref(false)

const errorProject = computed(() => selectedProjectIdCore.value !== '' ? undefined : 'No project selected or project is invalid')
const errorPermission = computed(() => selectedProject.value?.isMyProject ?? false ? undefined : 'You do not have permission to create jobs for this project')
const errorClassifier = computed(() => selectedClassifier.value > 0 ? undefined : 'Please select a classifier')

const errors = computed(() => shouldValidate.value ? [errorProject.value, errorPermission.value, errorClassifier.value].filter(isDefined) : [])

// Create job (call API)
const create = async (): Promise<void> => {
  // Enable validation on first submit
  shouldValidate.value = true

  // Reject if validation errors
  if (errors.value.length > 0) { return }

  // Reject if invalid project
  const selectedProjectIdCoreValue = selectedProjectIdCore.value
  if (!selectedProjectIdCoreValue) { return }

  // Save
  const testJob = {
    classifier_id: selectedClassifier.value,
    project_id: selectedProjectIdCoreValue,
    ...selectedQueryStreams.value && { query_streams: selectedQueryStreams.value },
    ...selectedQueryStart.value && { query_start: selectedQueryStart.value.toISOString() },
    ...selectedQueryEnd.value && { query_start: selectedQueryEnd.value.toISOString() },
    ...selectedQueryHours.value && selectedQueryHours.value.length > 0 && { query_hours: selectedQueryHours.value.join(',') }
  }

  mutatePostJob(testJob, { onSuccess: () => { router.push({ name: ROUTE_NAMES.cnnJobList }) } })
}
</script>
