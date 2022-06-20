<template>
  <page-title page-title="Create New CNN Job" />
  <el-alert
    v-if="warningMessage"
    :title="warningMessage"
    type="warning"
    class="my-4"
    effect="dark"
    @close="warningMessage = ''"
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
        <select
          id="models"
          v-model="selectedClassifier"
          class="block w-full p-2.5 bg-mirage-grey rounded-lg"
        >
          <option
            v-for="classifier in classifiers ?? []"
            :key="classifier.id"
            :value="classifier.id"
          >
            {{ classifier.name }} (v{{ classifier.version }})
          </option>
        </select>
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
    <div class="flex space-x-4">
      <router-link :to="{ name: ROUTE_NAMES.cnnJobList }">
        <button class="btn">
          Cancel
        </button>
      </router-link>
      <button
        :disabled="isLoadingPostJob || !hasPermissionToCreateJob"
        class="btn btn-primary"
        @click.prevent="create"
      >
        Create
      </button>
      <span v-if="isLoadingPostJob">Saving...</span>
      <span v-if="isErrorPostJob">Error :(</span>
      <span v-if="!hasPermissionToCreateJob">No permission to create job for this project 😞</span>
    </div>
  </form>
</template>
<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import SitePicker from '@/_services/picker/site-picker.vue'
import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import { useClassifiers } from '../_composables/use-classifiers'
import { usePostClassifierJob } from '../_composables/use-post-classifier-job'

const router = useRouter()
const store = useStore()

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading: isLoadingClassifiers, isError: isErrorClassifier, data: classifiers } = useClassifiers(apiClientCore)
const { isLoading: isLoadingPostJob, isError: isErrorPostJob, mutate: mutatePostJob } = usePostClassifierJob(apiClientCore)

// project
const selectedProject = computed(() => store.selectedProject)
const hasPermissionToCreateJob = computed(() => selectedProject.value?.isMyProject ?? false)

// validation
const warningMessage = ref('')

// create params
const selectedProjectIdCore = computed(() => selectedProject.value?.idCore)
const selectedClassifier = ref<number>(-1)
const selectedQueryStreams = ref<string | null>(null) // null = hasn't filled in yet, '' = all, 'AR' = filter only AR
// TODO: selected date range

watch(classifiers, () => { selectedClassifier.value = classifiers.value?.[0]?.id ?? -1 })

const hasErrorValidatingRequestParams = (): string | null => {
  // - classifier_id should not be -1
  // - project_id should not be null
  // - query_streams should not be null
  const validClassifier = selectedClassifier.value !== -1
  const validProject = selectedProjectIdCore.value !== ''
  const validQueryStreams = selectedQueryStreams.value !== null
  if (!validClassifier) return 'Please select classifier'
  else if (!validProject) return 'Project is not valid'
  else if (!validQueryStreams) return 'Please select sites'
  return null
}

const create = async (): Promise<void> => {
  // if some field is null, then warn the user!
  const errorValidatingRequestParams = hasErrorValidatingRequestParams()
  if (errorValidatingRequestParams) {
    // TODO: show error
    warningMessage.value = errorValidatingRequestParams
    return
  }
  const testJob = {
    classifier_id: selectedClassifier.value,
    project_id: selectedProjectIdCore.value ?? '',
    query_streams: selectedQueryStreams.value ?? ''
  }
  mutatePostJob(testJob, { onSuccess: () => { router.push({ name: ROUTE_NAMES.cnnJobList }) } })
}

const onSelectSites = (value: string) => {
  selectedQueryStreams.value = value
}
</script>
