<template>
  <div
    class="absolute top-full mt-2 z-50 bg-echo text-insight rounded-lg p-4 w-[900px] space-y-4 border border-util-gray-03 shadow-lg"
  >
    <!-- Date range -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Date range:</label>
      <input
        v-model="filters.dateRange.from"
        type="date"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
      <input
        v-model="filters.dateRange.to"
        type="date"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Date and Time -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Date and Time:</label>
      <input
        v-model.number="filters.dateTime.years"
        type="number"
        placeholder="Years"
        class="w-20 p-2 rounded bg-[#2a2a2a] text-white"
      >
      <SelectMultiple
        v-model="selectedMonths"
        :options="staticMonths ?? []"
        placeholder="Months"
      />
      <SelectMultiple
        v-model="selectedDays"
        :options="staticDays ?? []"
        placeholder="Days"
      />
      <SelectMultiple
        v-model="selectedHours"
        :options="staticHours ?? []"
        placeholder="Hours"
      />
    </div>

    <!-- Sites -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Sites:</label>
      <input
        v-model="sitesInput"
        type="text"
        placeholder="Site1, Site2, ..."
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Playlists -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Playlists:</label>
      <input
        v-model="playlistsInput"
        type="text"
        placeholder="Playlist1, Playlist2, ..."
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Tags -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Tags:</label>
      <input
        v-model="tagsInput"
        type="text"
        placeholder="Tags"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Validations -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Validations:</label>
      <input
        v-model="validationsSpeciesInput"
        type="text"
        placeholder="Species - Sound..."
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
      <input
        v-model="validationsValidationInput"
        type="text"
        placeholder="Validation"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Classifications -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Classifications:</label>
      <input
        v-model="classificationsInput"
        type="text"
        placeholder="Classifications..."
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
      <input
        v-model="resultsInput"
        type="text"
        placeholder="Results"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Soundscape Composition -->
    <div class="flex items-center space-x-2">
      <label class="w-32">Soundscape:</label>
      <input
        v-model="audioClassesInput"
        type="text"
        placeholder="Audio Classes"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
      <input
        v-model="annotationInput"
        type="text"
        placeholder="Annotation"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Buttons -->
    <div class="flex justify-between mt-4">
      <button
        class="btn btn-secondary btn-small text-sm px-[12px] py-[6px]"
        @click="resetFilters"
      >
        Reset filters
      </button>
      <button
        class="btn btn-primary btn-small text-sm px-[12px] py-[6px]"
        @click="emitApply"
      >
        Apply filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import SelectMultiple from './select-multiple.vue'

export interface DataItem {
  value: number
  string: string
  count: null
}

export interface FilterModel {
  dateRange: { from: string | null; to: string | null }
  dateTime: { years: number | null; months: number | null; days: number | null; hours: number | null }
  sites: string[]
  playlists: string[]
  tags: string[]
  validations: { speciesSound: string[]; validation: string[] }
  classifications: { classifications: string[]; results: string[] }
  soundscape: { audioClasses: string[]; annotation: string[] }
}

const emit = defineEmits<{(e: 'apply', value: FilterModel): void }>()

const filters = reactive<FilterModel>({
  dateRange: { from: null, to: null },
  dateTime: { years: null, months: null, days: null, hours: null },
  sites: [],
  playlists: [],
  tags: [],
  validations: { speciesSound: [], validation: [] },
  classifications: { classifications: [], results: [] },
  soundscape: { audioClasses: [], annotation: [] }
})

const sitesInput = ref('')
const playlistsInput = ref('')
const tagsInput = ref('')
const validationsSpeciesInput = ref('')
const validationsValidationInput = ref('')
const classificationsInput = ref('')
const resultsInput = ref('')
const audioClassesInput = ref('')
const annotationInput = ref('')

const isOpen = ref(false)
const selectedMonths = ref<(string)[]>([])
const dropdownMonthRef = ref<HTMLElement | null>(null)

const staticMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
].map((mon, ind) => ({ value: mon, label: mon, tooltip: mon }))

const selectedDays = ref<(string)[]>([])
const staticDays = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: (i + 1).toString(), tooltip: (i + 1).toString() }))

const selectedHours = ref<(string)[]>([])
const staticHours = [{ value: 'ALL', label: 'Select all', tooltip: 'Select all', isSelectAll: true }]
for (let hour = 0; hour < 24; hour++) {
  staticHours.push({ value: String(hour), label: (hour < 10 ? '0' : '') + hour + ':00', tooltip: (hour < 10 ? '0' : '') + hour + ':00', isSelectAll: false })
}
function splitCSV (str: string): string[] {
  return str.split(',').map(s => s.trim()).filter(Boolean)
}
function handleClickOutside (event: MouseEvent) {
  if (dropdownMonthRef.value && !dropdownMonthRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside)
  }, 0)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// watch
watch(sitesInput, (v) => { filters.sites = splitCSV(v) })
watch(playlistsInput, (v) => { filters.playlists = splitCSV(v) })
watch(tagsInput, (v) => { filters.tags = splitCSV(v) })
watch(validationsSpeciesInput, (v) => { filters.validations.speciesSound = splitCSV(v) })
watch(validationsValidationInput, (v) => { filters.validations.validation = splitCSV(v) })
watch(classificationsInput, (v) => { filters.classifications.classifications = splitCSV(v) })
watch(resultsInput, (v) => { filters.classifications.results = splitCSV(v) })
watch(audioClassesInput, (v) => { filters.soundscape.audioClasses = splitCSV(v) })
watch(annotationInput, (v) => { filters.soundscape.annotation = splitCSV(v) })

function resetFilters () {
  filters.dateRange.from = null
  filters.dateRange.to = null
  filters.dateTime.years = null
  filters.dateTime.months = null
  filters.dateTime.days = null
  filters.dateTime.hours = null
  filters.sites = []
  filters.playlists = []
  filters.tags = []
  filters.validations.speciesSound = []
  filters.validations.validation = []
  filters.classifications.classifications = []
  filters.classifications.results = []
  filters.soundscape.audioClasses = []
  filters.soundscape.annotation = []

  sitesInput.value = ''
  playlistsInput.value = ''
  tagsInput.value = ''
  validationsSpeciesInput.value = ''
  validationsValidationInput.value = ''
  classificationsInput.value = ''
  resultsInput.value = ''
  audioClassesInput.value = ''
  annotationInput.value = ''
}

function emitApply () {
  emit('apply', filters)
}
</script>
