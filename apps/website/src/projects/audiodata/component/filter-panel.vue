<template>
  <div
    class="absolute top-full mt-2 z-50 bg-echo text-insight rounded-lg p-4 w-[900px] space-y-4 border border-util-gray-03 shadow-lg"
  >
    <!-- Date range -->
    <div class="flex items-start space-x-2">
      <label>Date range:</label>
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
    <div class="flex items-start space-x-2">
      <label>Date and Time:</label>
      <SelectMultiple
        v-model="selectedYears"
        class="flex-1 min-w-0"
        :options="getYearOptions(dateRange?.min_date, dateRange?.max_date) ?? []"
        placeholder="Years"
      />
      <SelectMultiple
        v-model="selectedMonths"
        class="flex-1 min-w-0"
        :options="staticMonths ?? []"
        placeholder="Months"
      />
      <SelectMultiple
        v-model="selectedDays"
        class="flex-1 min-w-0"
        :options="staticDays ?? []"
        placeholder="Days"
      />
      <SelectMultiple
        v-model="selectedHours"
        class="flex-1 min-w-0"
        :options="staticHours ?? []"
        placeholder="Hours"
      />
    </div>

    <!-- Sites -->
    <div class="flex items-start space-x-2">
      <label>Sites:</label>
      <SelectMultiple
        v-model="selectedSites"
        class="flex-1 min-w-0"
        :options="staticSites ?? []"
        placeholder="Site1, Site2, ..."
      />
    </div>

    <!-- Playlists -->
    <div class="flex items-start space-x-2">
      <label>Playlists:</label>
      <SelectMultiple
        v-model="selectedPlaylists"
        class="flex-1 min-w-0"
        :options="staticPlaylists ?? []"
        placeholder="Playlist1, Playlist2, ..."
      />
    </div>

    <!-- Tags -->
    <div class="flex items-start space-x-2">
      <label>Tags:</label>
      <SelectMultiple
        v-model="selectedTags"
        class="flex-1 min-w-0"
        :options="staticTags ?? []"
        placeholder="Tags"
      />
    </div>

    <!-- Validations -->
    <div class="flex items-start space-x-2">
      <label>Validations:</label>
      <SelectMultiple
        v-model="selectedClasses"
        class="flex-1 min-w-0"
        :options="staticClasses ?? []"
        placeholder="Species - Sound..."
      />
      <input
        v-model="validationsValidationInput"
        type="text"
        placeholder="Validation"
        class="flex-1 p-2 rounded bg-[#2a2a2a] text-white"
      >
    </div>

    <!-- Classifications -->
    <div class="flex items-start space-x-2">
      <label>Classifications:</label>
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
    <div class="flex items-start space-x-2">
      <label class="w-32">Soundscape:</label>
      <SelectMultiple
        v-model="selectedSoundscapes"
        class="flex-1 min-w-0"
        :options="staticSoundscapes ?? []"
        placeholder="Audio Classes"
      />
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
import dayjs from 'dayjs'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { type ClassesRecordingResponse, type PlaylistResponse, type SoundscapeResponse, type TagResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteResponse } from '@rfcx-bio/common/api-arbimon/audiodata/sites'

import SelectMultiple from './select-multiple.vue'
import { type Option } from './select-multiple.vue'

export interface DataItem {
  value: number
  string: string
  count: null
}
export interface DateTime {
  max_date: string
  min_date: string
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
const props = defineProps<{
  dateRange: DateTime | undefined,
  sites: SiteResponse[] | undefined,
  playlists: PlaylistResponse[] | undefined,
  tags: TagResponse[] | undefined
  classes: ClassesRecordingResponse[] | undefined,
  soundscapes: SoundscapeResponse[] | undefined
}>()

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

const selectedYears = ref<(number)[]>([])
function getYearOptions (minDate: string| undefined, maxDate: string| undefined): Option[] {
  if (!minDate || !maxDate) return []
  const startYear = dayjs(minDate).year()
  const endYear = dayjs(maxDate).year()

  const years: Option[] = []
  for (let year = endYear; year >= startYear; year--) {
    years.push({
      value: year,
      label: String(year),
      tooltip: String(year)
    })
  }
  return years
}

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

const selectedSites = ref<(string)[]>([])
const staticSites = computed<Option[]>(() =>
  (props.sites ?? []).map(site => ({
    value: site.name,
    label: site.name,
    tooltip: site.name
  }))
)

const selectedPlaylists = ref<(string)[]>([])
const staticPlaylists = computed<Option[]>(() =>
  (props.playlists ?? []).map(p => ({
    value: p.name,
    label: p.name,
    tooltip: p.name,
    count: p.count
  }))
)

const selectedTags = ref<(number)[]>([])
const staticTags = computed<Option[]>(() =>
  (props.tags ?? []).map(t => ({
    value: t.tag_id,
    label: t.tag,
    tooltip: t.tag,
    count: t.count,
    tagIcon: true
  }))
)

const selectedClasses = ref<(number|string)[]>([])
const staticClasses = computed<Option[]>(() =>
  (props.classes ?? []).map(item => ({
    label: `${item.species_name} - ${item.songtype_name}`,
    value: item.id,
    tooltip: `${item.species_name} - ${item.songtype_name}`,
    isSelectAll: false,
    badges: [
        { icon: 'val-1', value: item.vals_present },
        { icon: 'val-0', value: item.vals_absent }
      ]
  }))
)

const selectedSoundscapes = ref<(number)[]>([])
const staticSoundscapes = computed<Option[]>(() =>
  (props.soundscapes ?? []).map(item => ({
    label: item.name,
    value: item.id,
    tooltip: `${item.type} / ${item.name}`,
    group: item.type
  }))
)

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

<style scoped>
label {
  @apply w-32 min-w-32;
}
</style>
