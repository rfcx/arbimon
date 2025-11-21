<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] isolate flex items-center justify-center ml-120"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6">
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-2xl font-header">
            Create New Training Set
          </h2>
          <button
            type="button"
            title="Cancel"
            @click="$emit('cancel'); clearData()"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <div>
          <label
            for="trainingSetName"
            class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
          >Name</label>
          <input
            id="trainingSetName"
            v-model="trainingSetName"
            name="trainingSetName"
            type="text"
            maxlength="80"
            class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
            placeholder="New training set"
            required
          >
        </div>
        <div>
          <label
            for="speciesSound"
            class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
          >Species Sound</label>
          <div class="relative w-full">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="Select a species class"
              class="placeholder-style rounded h-[34px] w-full items-center inline-flex border-2 border-FFFEFC bg-moss flex-1 min-w-0 placeholder-util-gray-02"
              required
              @click="toggleInput = !toggleInput"
            >
            <div
              class="absolute w-5/6 left-4 z-60 bg-white rounded-md shadow dark:bg-moss mt-2 border-util-gray-03 border-1"
              :class="{'hidden': toggleInput === false }"
            >
              <ul class="mb-2 pl-0 max-h-40 overflow-y-scroll">
                <li
                  v-if="filteredClass.length === 0 && searchKeyword.length > 0"
                  class="flex flex-col px-4 py-2 gap-y-2 text-sm"
                >
                  We cannot find the species "{{ searchKeyword }}" in the project.
                </li>
                <template v-if="filteredClass.length">
                  <li
                    v-for="species in filteredClass"
                    :key="'species-class-' + species.id"
                    :label="species.species_name"
                    class="flex flex-row relative rounded-sm cursor-pointer px-4 py-2 hover:bg-util-gray-03"
                    :class="{'bg-util-gray-03': species.species_name === selectedClass?.species_name}"
                    @click="selectClass(species)"
                  >
                    <span class="text-sm">{{ species.species_name }},</span>
                    <span class="text-sm pl-1">{{ species.songtype_name }}</span>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-between items-center gap-x-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium"
            @click="$emit('cancel'); clearData()"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 btn btn-primary btn-medium disabled:(cursor-not-allowed opacity-60)"
            :disabled="isDisabled()"
            @click="onEmitTrainingSet"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import type { ClassesRecordingResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetClasses } from '../../_composables/use-recordings'

defineProps<{ visible: boolean }>()

const emits = defineEmits<{(e: 'cancel'): void, (e: 'emitTrainingSetData', name: string, songtype: number): void}>()

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const searchKeyword = ref<string>('')
const trainingSetName = ref<string>('')
const toggleInput = ref<boolean>(false)
const selectedClass = ref<ClassesRecordingResponse>()
const selectedProjectSlug = computed(() => store.project?.slug)

const store = useStore()

const { data: projectClasses } = useGetClasses(apiClientArbimon, selectedProjectSlug)

const filteredClass = computed((): ClassesRecordingResponse[] => {
  const prefix = searchKeyword.value.toLocaleLowerCase()
  return (projectClasses.value ?? []).filter(cl => cl.species_name.toLocaleLowerCase().startsWith(prefix))
})

const selectClass = (cl: ClassesRecordingResponse) => {
  selectedClass.value = cl
  searchKeyword.value = cl.species_name
  toggleInput.value = false
}

const isDisabled = () => {
  return !trainingSetName.value || selectedClass.value?.id === undefined
}

const clearData = () => {
  selectedClass.value = undefined
  searchKeyword.value = ''
  trainingSetName.value = ''
}

const onEmitTrainingSet = () => {
  if (!trainingSetName.value || selectedClass.value?.id === undefined) return
  emits('emitTrainingSetData', trainingSetName.value, selectedClass.value.id)
}

</script>

<style lang="scss">

.dark .dark\:bg-gray-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(30, 28, 19, var(--tw-bg-opacity)) !important;
}

.dark .dark\:text-gray-400 {
  color: #FFFEFC !important;
}

</style>
