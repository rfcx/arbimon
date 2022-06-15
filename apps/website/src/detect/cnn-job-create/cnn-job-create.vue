<template>
  <page-title page-title="Create New CNN Job" />
  <form class="mt-5">
    <ol class="relative border-l border-box-grey">
      <li class="mb-8 ml-6">
        <span class="flex absolute -left-3 text-xs justify-center items-center w-6 h-6 bg-steel-grey rounded-full ring-1 ring-box-grey">
          1
        </span>
        <h2 class="mb-4 text-md">
          Choose Model
        </h2>
        <span v-if="isLoading">Loading</span>
        <span v-else-if="isError">Error</span>
        <span v-else-if="data === undefined">No response</span>
        <select
          id="models"
          v-model="selectedClassifier"
          class="block w-full p-2.5 bg-steel-grey rounded-full rounded-lg ring-1 ring-subtle"
        >
          <option
            v-for="classifier in data ?? []"
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
          <input
            id="sites"
            type="text"
            class="input-field"
            placeholder="Select sites"
            required
          >
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
      <router-link :to="{ name: ROUTE_NAMES.cnnJobList }">
        <button class="btn btn-primary">
          Create
        </button>
      </router-link>
    </div>
  </form>
</template>
<script setup lang="ts">
import { AxiosInstance } from 'axios'
import { inject, ref, watch } from 'vue'

import { apiClientCoreKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
// import { usePostClassifierJob } from '../_composables/use-post-classifier-job'
import { useClassifiers } from '../_composables/use-classifiers'

const apiClientCore = inject(apiClientCoreKey) as AxiosInstance
const { isLoading, isError, data } = useClassifiers(apiClientCore)

const selectedClassifier = ref(-1)
watch(data, () => { selectedClassifier.value = data.value?.[0]?.id ?? -1 })

// const create = async (): Promise<void> => {
//   const testJob = {
//     classifier_id: 8,
//     project_id: 'bbbbbbbbbbb7',
//     query_streams: 'Antony*'
//   }
//   const result = await classifierJobCreate(apiClientCore, testJob)
//   console.info(result)
// }
</script>
