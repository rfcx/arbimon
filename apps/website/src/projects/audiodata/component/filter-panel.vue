<template>
  <div
    ref="panelRef"
    class="absolute top-full mt-2 z-50 bg-echo text-insight rounded-lg p-4 w-[900px] space-y-4 border border-util-gray-03 shadow-lg"
  >
    <button
      class="absolute top-4 right-4 text-white hover:opacity-70"
      aria-label="Close"
      @click="close"
    >
      <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
    </button>

    <span class="text-[22px] font-bold mb-4 font-header">
      Filters
    </span>

    <!-- Date range -->
    <div class="flex items-start">
      <label>Date range:</label>
      <span
        ref="datePickerStartDate"
        class="w-full"
      >
        <el-date-picker
          v-model="dateStart"
          class="custom-h w-full border text-secondary border-util-gray-03 rounded-md dark:(bg-pitch text-secondary placeholder:text-placeholder) focus:(border-frequency ring-frequency)"
          type="date"
          placeholder="Choose start date"
          format="DD/MM/YYYY"
          :disabled-date="disabledStartDate"
          :teleported="false"
        />
      </span>
      <div class="px-3 py-1">
        -
      </div>
      <span
        ref="datePickerEndDate"
        class="w-full"
      >
        <el-date-picker
          v-model="dateEnd"
          class="custom-h h-[34px] w-full border text-secondary border-util-gray-03 rounded-md dark:(bg-pitch text-secondary placeholder:text-placeholder) focus:(border-frequency ring-frequency)"
          type="date"
          placeholder="Choose end date"
          format="DD/MM/YYYY"
          :disabled-date="disabledEndDateRange"
          :teleported="false"
        />
      </span>
    </div>

    <!-- Date and Time -->
    <div class="flex items-start">
      <label>Date and Time:</label>
      <SelectMultiple
        v-model="selectedYears"
        class="flex-[1] min-w-0"
        :options="getYearOptions(dateRange?.min_date, dateRange?.max_date) ?? []"
        placeholder="Years"
      />
      <SelectMultiple
        v-model="selectedMonths"
        class="flex-[1] min-w-0 ml-1"
        :options="staticMonths ?? []"
        placeholder="Months"
      />
      <SelectMultiple
        v-model="selectedDays"
        class="flex-[1] min-w-0 ml-1"
        :options="staticDays ?? []"
        placeholder="Days"
      />
      <SelectMultiple
        v-model="selectedHours"
        class="flex-[1] min-w-0 ml-1"
        :options="staticHours ?? []"
        placeholder="Hours"
      />
    </div>

    <div class="my-2 border-t-1 border-util-gray-03 border-line" />

    <!-- Sites -->
    <div class="flex items-start">
      <label>Sites:</label>
      <SelectMultiple
        v-model="selectedSites"
        class="flex-1 min-w-0"
        :options="staticSites ?? []"
        placeholder="Site1, Site2, ..."
      />
    </div>

    <!-- Playlists -->
    <div class="flex items-start">
      <label>Playlists:</label>
      <SelectMultiple
        v-model="selectedPlaylists"
        class="flex-1 min-w-0"
        :options="staticPlaylists ?? []"
        placeholder="Playlist1, Playlist2, ..."
      />
    </div>

    <!-- Tags -->
    <div class="flex items-start">
      <label>Tags:</label>
      <SelectMultiple
        v-model="selectedTags"
        class="flex-1 min-w-0"
        :options="staticTags ?? []"
        placeholder="Tags"
      />
    </div>

    <div class="my-2 border-t-1 border-util-gray-03 border-line" />

    <!-- Validations -->
    <div class="flex items-start">
      <label>Validations:</label>
      <SelectMultiple
        v-model="selectedClasses"
        class="flex-[7] min-w-0"
        :options="staticClasses ?? []"
        placeholder="Species - Sound..."
      />
      <SelectMultiple
        v-model="selectedValidation"
        class="flex-[3] min-w-0 ml-2"
        :options="staticOptions ?? []"
        :hide-after-selected="true"
        placeholder="Validation"
      />
    </div>

    <!-- Classifications -->
    <div class="flex items-start">
      <label>Classifications:</label>
      <SelectMultiple
        v-model="selectedClassifications"
        class="flex-[7] min-w-0"
        :options="staticClassifications ?? []"
        placeholder="Classifications..."
      />
      <SelectMultiple
        v-model="selectedResults"
        class="flex-[3] min-w-0 ml-2"
        :options="haveThreshold() ? thresholdOptions : staticClassificationOptions ?? []"
        :hide-after-selected="true"
        placeholder="Results"
      />
    </div>

    <!-- Soundscape Composition -->
    <div class="flex items-start">
      <label class="w-32">Soundscape:</label>
      <SelectMultiple
        v-model="selectedSoundscapes"
        class="flex-[7] min-w-0"
        :options="staticSoundscapes ?? []"
        placeholder="Audio Classes"
      />
      <SelectMultiple
        v-model="selectedAnnotation"
        class="flex-[3] min-w-0 ml-2"
        :options="staticOptions ?? []"
        :hide-after-selected="true"
        placeholder="Annotation"
      />
    </div>

    <!-- Buttons -->
    <div class="flex justify-between mt-4">
      <button
        class="btn btn-secondary btn-small text-sm px-[12px] h-[34px]"
        @click="resetFilters"
      >
        Clear filters
        <icon-custom-ic-loading-dark
          v-if="isResetFilters"
          class="animate-spin text-xl ml-2 inline-flex"
        />
      </button>
      <button
        class="btn btn-primary btn-small text-sm px-[12px] h-[34px]"
        @click="emitApply"
      >
        Apply filters
        <icon-custom-ic-loading-dark
          v-if="isLoading"
          class="animate-spin text-xl ml-2 inline-flex"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { type ClassesRecordingResponse, type ClassificationsResponse, type PlaylistResponse, type RecordingSearchParams, type SoundscapeResponse, type TagResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
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

const emit = defineEmits<{(e: 'apply', value: RecordingSearchParams): void, (e: 'resetFilters', value: RecordingSearchParams): void, (e: 'close'): void }>()
const props = defineProps<{
  dateRange: DateTime | undefined,
  sites: SiteResponse[] | undefined,
  playlists: PlaylistResponse[] | undefined,
  tags: TagResponse[] | undefined
  classes: ClassesRecordingResponse[] | undefined,
  soundscapes: SoundscapeResponse[] | undefined
  classifications: ClassificationsResponse[] | undefined
  filtersData?: RecordingSearchParams | undefined
  isReset?: boolean
}>()

function isFuture (time: Date) {
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  return time.getTime() > todayEnd.getTime()
}

function disabledStartDate (time: Date) {
  return isFuture(time)
}

function disabledEndDateRange (time: Date) {
  if (isFuture(time)) return true
  if (dateStart.value) {
    const start = new Date(dateStart.value)
    start.setHours(0, 0, 0, 0)
    return time.getTime() < start.getTime()
  }
  return false
}

const filters = reactive<RecordingSearchParams>({
  limit: 10,
  offset: 0,
  output: ['count', 'date_range', 'list'],
  sortBy: 'r.site_id DESC, r.datetime DESC',
  playlists: undefined,
  range: undefined,
  sites: undefined,
  sites_ids: undefined,
  soundscape_composition: undefined,
  soundscape_composition_annotation: undefined,
  tags: undefined,
  validations: undefined,
  years: undefined,
  days: undefined,
  hours: undefined,
  months: undefined,
  classifications: undefined,
  classification_results: undefined
})
const dateStart = ref<string | undefined>()
const dateEnd = ref<string | undefined>()

const isOpen = ref(false)
const isLoading = ref(false)

function formatTimestamp (timestamp: number): string {
  return dayjs(timestamp).format('MMM D, YYYY h:mm A')
}

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

const selectedMonths = ref<(number)[]>([])
const staticMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
].map((mon, ind) => ({ value: ind, label: mon, tooltip: mon }))

const selectedDays = ref<(number)[]>([])
const staticDays = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: (i + 1).toString(), tooltip: (i + 1).toString() }))

const selectedHours = ref<(string)[]>([])
const staticHours = [{ value: 'ALL', label: 'Select all', tooltip: 'Select all', isSelectAll: true }]
for (let hour = 0; hour < 24; hour++) {
  staticHours.push({ value: String(hour), label: (hour < 10 ? '0' : '') + hour + ':00', tooltip: (hour < 10 ? '0' : '') + hour + ':00', isSelectAll: false })
}

const selectedSites = ref<(number)[]>([])
const staticSites = computed<Option[]>(() =>
  (props.sites ?? []).map(site => ({
    value: site.id,
    label: site.name,
    tooltip: site.name
  }))
)
const selectedSiteNames = computed(() => {
  return (props.sites ?? [])
    .filter(site => selectedSites.value.includes(site.id))
    .map(site => site.name)
})

const selectedPlaylists = ref<(number)[]>([])
const staticPlaylists = computed<Option[]>(() =>
  (props.playlists ?? []).map(p => ({
    value: p.id,
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
    icon: 'tag-icon',
    tagIcon: true
  }))
)

const selectedClassifications = ref<(number)[]>([])
const staticClassifications = computed<Option[]>(() =>
  (props.classifications ?? []).map(c => ({
    value: c.job_id,
    label: c.cname + ' - ' + formatTimestamp(c.date),
    tooltip: c.cname + ' - ' + formatTimestamp(c.date)
  }))
)

const checkThreshold = computed(() => {
  return (props.classifications ?? [])
    .filter(c => selectedClassifications.value.includes(c.job_id))
    .map(classification => classification?.threshold)
})

function haveThreshold (): boolean {
  return checkThreshold.value.some(v => v !== null && v !== undefined)
}

const selectedClasses = ref<(number)[]>([])
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

const selectedValidation = ref<(string)[]>([])
const selectedResults = ref<(string)[]>([])
const selectedAnnotation = ref<(string)[]>([])
const staticOptions = [
  { icon: 'val-1', label: 'Present', value: 'present' },
  { icon: 'val-0', label: 'Absent', value: 'absent' }
]

const staticClassificationOptions = [
  { icon: 'val-1', label: 'Present', value: '{"model": 1}' },
  { icon: 'val-0', label: 'Absent', value: '{"model": 0}' }
]

const thresholdOptions = [
  { label: 'Model: present, Threshold: present', value: '{"model":1, "th":1}', tooltip: 'Model: present, Threshold: present' },
  { label: 'Model: present, Threshold: absent', value: '{"model":1, "th":0}', tooltip: 'Model: present, Threshold: absent' },
  { label: 'Model: absent, Threshold: present', value: '{"model":0, "th":1}', tooltip: 'Model: absent, Threshold: present' },
  { label: 'Model: absent, Threshold: absent', value: '{"model":0, "th":0}', tooltip: 'Model: absent, Threshold: absent' }
]
const isThreshold = (v: string) =>
  thresholdOptions.some(opt => opt.value === v)

const isStatic = (v: string) =>
  staticClassificationOptions.some(opt => opt.value === v)

const effectiveSelected = computed<string[]>(() => {
  const src = selectedResults.value.map(String)
  return haveThreshold()
    ? src.filter(isThreshold)
    : src.filter(isStatic)
})

const panelRef = ref<HTMLElement | null>(null)

const datePickerStartDate = ref<HTMLElement | null>(null)
const datePickerEndDate = ref<HTMLElement | null>(null)

function handleClickOutside (event: MouseEvent) {
  const target = event.target as Node

  const insidePanel = panelRef.value?.contains(target) ?? false
  const insideStart = datePickerStartDate.value?.contains(target) ?? false
  const insideEnd = datePickerEndDate.value?.contains(target) ?? false

  const insideElPopper = target instanceof Element && !!(target.closest('.el-picker-panel, .el-popper'))
  const clickedInside = insidePanel || insideStart || insideEnd || insideElPopper

  if (!clickedInside) {
    isOpen.value = false
  }
}

function toRange (fromISO?: string, toISO?: string) {
  if (!fromISO || !toISO) return undefined

  const fromDate = new Date(fromISO)
  const toDate = new Date(toISO)

  const pad = (n: number) => String(n).padStart(2, '0')

  const formatDate = (d: Date, endOfDay = false) => {
    const year = d.getUTCFullYear()
    const month = pad(d.getUTCMonth() + 1)
    const day = pad(d.getUTCDate())
    return `${year}-${month}-${day}T${endOfDay ? '23:59:59.999Z' : '00:00:00.000Z'}`
  }

  const range = {
    from: formatDate(fromDate, false),
    to: formatDate(toDate, true)
  }
  return JSON.stringify(range)
}

watch(dateStart, (v) => { filters.range = toRange(v, dateEnd.value) })
watch(dateEnd, (v) => { filters.range = toRange(dateStart.value, v) })

onMounted(() => {
  const v = props.filtersData
  selectedYears.value = v?.years ?? []
  selectedMonths.value = v?.months ?? []
  selectedDays.value = v?.days ?? []
  selectedHours.value = (v?.hours ?? []).map(String)
  selectedSites.value = v?.sites_ids ?? []
  selectedPlaylists.value = v?.playlists ?? []
  selectedTags.value = v?.tags ?? []
  selectedClasses.value = v?.validations ?? []
  selectedValidation.value = v?.presence ?? []
  selectedClassifications.value = v?.classifications ?? []
  selectedResults.value = v?.classification_results ?? []
  selectedSoundscapes.value = v?.soundscape_composition ?? []
  selectedAnnotation.value = v?.soundscape_composition_annotation ?? []
  applyRangeJSON(v?.range)
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside)
  }, 0)
})

function applyRangeJSON (rangeStr?: string) {
  if (!rangeStr) { dateStart.value = ''; dateEnd.value = ''; return }
  try {
    const { from, to } = JSON.parse(rangeStr) as { from: string; to: string }
    dateStart.value = from.slice(0, 10) // "YYYY-MM-DD"
    dateEnd.value = to.slice(0, 10)
  } catch (e) {
    console.error('Invalid range JSON', e)
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(selectedYears, (v) => { filters.years = v })
watch(selectedMonths, (v) => { filters.months = v })
watch(selectedDays, (v) => { filters.days = v })
watch(selectedHours, (v) => {
  if (v.includes('ALL')) {
    filters.hours = Array.from({ length: 24 }, (_, i) => i)
  } else {
    filters.hours = v.map(h => Number(h))
  }
 })
watch(selectedSites, (v) => {
  filters.sites_ids = v
  filters.sites = selectedSiteNames.value
})
watch(selectedPlaylists, (v) => { filters.playlists = v })
watch(selectedTags, (v) => { filters.tags = v })

watch(selectedClasses, (v) => { filters.validations = v })
watch(selectedValidation, (v) => { filters.presence = v })

watch(selectedClassifications, (v) => {
  filters.classifications = v
  filters.classification_results = effectiveSelected.value
})
watch(selectedResults, () => {
  filters.classification_results = effectiveSelected.value
})

watch(selectedSoundscapes, (v) => { filters.soundscape_composition = v })
watch(selectedAnnotation, (v) => { filters.soundscape_composition_annotation = v })

function emitApply () {
  isLoading.value = true
  emit('apply', filters)
}

function close () {
  emit('close')
}

const isResetFilters = ref(false)
watch(() => props.isReset, (v) => { isResetFilters.value = v })

function resetFilters () {
  isResetFilters.value = true
  filters.range = undefined
  selectedYears.value = []
  selectedMonths.value = []
  selectedDays.value = []
  selectedHours.value = []
  selectedSites.value = []
  selectedPlaylists.value = []
  selectedTags.value = []
  selectedClasses.value = []
  selectedValidation.value = []
  selectedClassifications.value = []
  selectedResults.value = []
  selectedSoundscapes.value = []
  selectedAnnotation.value = []
  dateEnd.value = ''
  dateStart.value = ''
  emit('resetFilters', filters)
}
</script>

<style scoped>
label {
  @apply w-32 min-w-32 mt-[11px] text-[14px] font-medium;
}
:deep(#selectMultiple .input-select-multiple) {
  @apply bg-[#1e1c13] text-insight rounded-md py-[1px] font-medium;
}
:deep(#selectMultiple input) {
  @apply text-insight font-medium;
}
:deep(.el-input__inner) {
  @apply h-[36px] leading-[36px];
  font-size: 14px !important;
}
:deep(.custom-h .el-input__wrapper) {
  height: 36px;
  min-height: 36px;
  padding-top: 0;
  padding-bottom: 0;
}
:deep(.custom-h .el-input__inner::placeholder) {
  @apply text-[#FFFEFC] text-insight text-sm font-medium;
}

:deep(.el-date-editor.el-input) {
  @apply bg-[#1e1c13] text-insight rounded-md text-sm font-medium;
  height: 36px;
}
:deep(.custom-h .el-input__icon) {
  @apply text-[#FFFEFC] mt-1;
}

</style>
