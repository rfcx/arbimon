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
      <SelectMultiple
        v-model="selectedSoundscape"
        :options="mapSoundscapeToOptions(soundscapeRecordings ?? [])"
        placeholder="Wind, Birds, ..."
      />
    </div>

    <div>
      <label class="block text-sm mb-1">Tags</label>
      <SelectMultiple
        v-model="selectedTags"
        :options="mapTagToOptions(tagsRecording ?? [])"
        placeholder="Tags..."
      />
    </div>

    <div>
      <label class="block text-sm mb-1">Grouping of Detections</label>
      <div
        ref="dropdownRef"
        class="relative w-full"
      >
        <div
          class="input-style border px-3 py-2 rounded cursor-pointer"
          @click="isOpen = !isOpen"
        >
          {{ selectedGrouping || 'Select option' }}
        </div>
        <div
          v-if="isOpen"
          class="px-2 py-2 absolute left-0 top-full mt-1 w-full bg-echo rounded shadow z-50 border border-util-gray-03"
        >
          <div
            v-for="opt in optionsGrouping"
            :key="opt"
            class="px-2 py-1 hover:bg-moss cursor-pointer text-sm rounded font-medium"
            @click="selectGrouping(opt)"
          >
            {{ opt }}
          </div>
        </div>
      </div>
    </div>

    <div>
      <label class="block text-sm mb-1">Species detection matrix</label>
      <SelectMultiple
        v-model="selectedSpecies"
        :options="speciesOption ?? []"
        placeholder="Select species..."
      />
    </div>

    <div class="flex justify-between mt-4">
      <button class="btn btn-secondary  btn-small w-full items-center justify-center inline-flex hover:text-pitch mr-1">
        <icon-fa-undo class="h-3 w-3 mr-1" />
        Reset
      </button>
      <button
        class="btn btn-primary btn-small w-full items-center justify-center inline-flex ml-1"
        @click="exportData()"
      >
        <icon-fa-send-o class="h-3 w-3 mr-1" />
        Export Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'

import { type ClassesRecordingResponse, type ExportParams, type SoundscapeResponse, type TagResponse, apiLegacyExport } from '@rfcx-bio/common/api-arbimon/audiodata/recording'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetClasses, useGetSoundscape, useGetTags } from '../api/use-recordings'
import SelectMultiple from './select-multiple.vue'
import { type Option } from './select-multiple.vue'

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)

const { data: classesRecordings } = useGetClasses(apiClientArbimon, selectedProjectSlug)
const { data: soundscapeRecordings } = useGetSoundscape(apiClientArbimon, selectedProjectSlug)

const { data: tagsRecording } = useGetTags(apiClientArbimon, selectedProjectSlug)

const optionsGrouping = ['Site', 'Hour', 'Date']
const selectedGrouping = ref<string | null>(null)
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function selectGrouping (opt: string) {
  selectedGrouping.value = opt
  isOpen.value = false
}

function handleClickOutside (event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const selectedFields = ref<(string)[]>(['filename', 'site', 'day'])
const fieldsOptions = [
  { value: 'filename', label: 'Filename', tooltip: 'The recording filename' },
  { value: 'site', label: 'Site', tooltip: 'The recording site' },
  { value: 'day', label: 'Day', tooltip: 'The recording day' },
  { value: 'hour', label: 'Hour', tooltip: 'The recording hour' },
  { value: 'url', label: 'Url', tooltip: 'The recording URl' }
]

const selectedClasses = ref<(number)[]>([])
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

const selectedSoundscape = ref<(number)[]>([])
function mapSoundscapeToOptions (data: SoundscapeResponse[]): Option[] {
  return data.map(item => ({
    label: item.name,
    value: item.id,
    tooltip: item.name,
    group: item.type
  }))
}

const selectedTags = ref<(number)[]>([])
function mapTagToOptions (data: TagResponse[]): Option[] {
  return data.map(item => ({
    label: item.tag,
    value: item.tag_id,
    tooltip: item.tag,
    count: item.count
  }))
}

const selectedSpecies = ref<(string)[]>([])
const speciesOption = computed(() => {
  if (!classesRecordings.value) return
  const uniqueNames = [...new Set(classesRecordings.value.map(item => item.species_name))]
  const baseOptions = uniqueNames.map(item => ({
    label: item,
    value: item.split(' ').join('_'),
    tooltip: item
  }))
  return [
      { label: 'Select all species', value: 'ALL', isSelectAll: true },
      ...baseOptions
    ]
})

async function exportData () {
  let selectedSpeciesId: number[] = []

  if (classesRecordings.value) {
    selectedSpeciesId = Array.from(new Set(
      classesRecordings.value
        .filter(item => selectedSpecies.value.includes(item.species_name.split(' ').join('_')))
        .map(item => item.species)
    ))
  }

  const exportParams = ref<(ExportParams| null)>(null)
  exportParams.value = {
    filters: { userEmail: store.user?.email ?? '' },
    show: {
      ...(selectedFields.value?.length ? { recording: selectedFields.value } : {}),
      ...(selectedSpecies.value?.length ? { species_name: selectedSpecies.value } : {}),
      ...(selectedTags.value?.length ? { tag: selectedTags.value } : {}),
      ...(selectedSoundscape.value?.length ? { soundscapeComposition: selectedSoundscape.value } : {}),
      ...(selectedClasses.value?.length ? { validation: selectedClasses.value } : {}),
      ...(selectedGrouping.value ? { grouped: selectedGrouping.value.toLowerCase() } : {}),
      ...(selectedSpeciesId.length ? { species: Array.from(selectedSpeciesId) } : {})
    }
  }
  try {
    await apiLegacyExport(apiClientArbimon, selectedProjectSlug.value ?? '', exportParams.value)
    // showAlertDialog('success', 'Success', 'Removed')
  } catch (e) {
    // showAlertDialog('error', 'Error', 'Remove site')
  }

  console.info('exportParams', exportParams.value)
}
</script>

<style lang="scss">
.input-style {
  @apply bg-echo text-insight w-full rounded px-3 py-2 text-sm placeholder-insight border border-util-gray-03 hover:ring-0 hover:ring-offset-0;
}

.input-style:focus {
  @apply outline-none shadow-none ring-0 ring-offset-0 border-util-gray-03
}

.select:focus {
  @apply outline-none shadow-none ring-0 ring-offset-0 border-util-gray-03
}
</style>
