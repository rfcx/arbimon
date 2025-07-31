<template>
  <div class="absolute top-full mt-2 z-50 bg-moss border-0 text-white rounded-lg p-4 w-[400px] space-y-4 border border-util-gray-03 shadow-lg">
    <div>
      <h3 class="block text-sm mb-1">
        Recording fields
      </h3>
      <SelectMultiple
        v-model="selectedFields"
        :options="fieldsOptions"
        placeholder="filename, site, ..."
      />
    </div>

    <div>
      <label class="block text-sm mb-1">Validations by species/song type</label>
      <SelectMultiple
        v-model="selectedClasses"
        :options="mapToOptions(classesRecordings ?? [])"
        placeholder="Species - Sound..."
      />
    </div>

    <div>
      <label class="block text-sm mb-1">Soundscape Composition</label>
      <input
        placeholder="Wind, Birds, ..."
        class="input-style"
      >
    </div>

    <div>
      <label class="block text-sm mb-1">Tags</label>
      <input
        placeholder="Tags..."
        class="input-style"
      >
    </div>

    <div>
      <label class="block text-sm mb-1">Grouping of Detections</label>
      <select class="input-style">
        <option
          disabled
          selected
          value=""
        >
          Select group...
        </option>
        <option>Group A</option>
        <option>Group B</option>
      </select>
    </div>

    <div>
      <label class="block text-sm mb-1">Species detection matrix</label>
      <input
        placeholder="Select species..."
        class="input-style"
      >
    </div>

    <div class="flex justify-between mt-4">
      <button class="btn btn-secondary  btn-small w-full items-center justify-center inline-flex hover:text-pitch mr-1">
        <icon-fa-undo class="h-3 w-3 mr-1" />
        Reset
      </button>
      <button class="btn btn-primary btn-small w-full items-center justify-center inline-flex ml-1">
        <icon-fa-send-o class="h-3 w-3 mr-1" />
        Export Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type ClassesRecordingResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetClasses } from '../api/use-recordings'
import SelectMultiple from './select-multiple.vue'
import { type Option } from './select-multiple.vue'

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const { data: classesRecordings } = useGetClasses(apiClientArbimon, selectedProjectSlug)

const selectedFields = ref<(string | number)[]>(['filename', 'site', 'day'])
const fieldsOptions = [
  { value: 'filename', label: 'Filename', tooltip: 'The recording filename' },
  { value: 'site', label: 'Site', tooltip: 'The recording site' },
  { value: 'day', label: 'Day', tooltip: 'The recording day' },
  { value: 'hour', label: 'Hour', tooltip: 'The recording hour' },
  { value: 'url', label: 'Url', tooltip: 'The recording URl' }
]

const selectedClasses = ref<(string | number)[]>([])
function mapToOptions (data: ClassesRecordingResponse[]): Option[] {
  const baseOptions = data.map(item => ({
    label: `${item.species_name} - ${item.songtype_name}`,
    value: item.id,
    tooltip: `${item.species_name} - ${item.songtype_name}`,
    badges: [
        { icon: 'val-1', value: item.vals_present },
        { icon: 'val-0', value: item.vals_absent }
      ]
  }))
  return [
      { label: 'Select all species', value: 'ALL', isSelectAll: true },
      ...baseOptions
    ]
}
</script>

<style lang="scss">
.input-style {
  @apply bg-echo text-insight w-full rounded px-3 py-2 text-sm placeholder-insight border border-util-gray-03;
}
</style>
