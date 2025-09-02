<template>
  <div
    ref="panelRef"
    class="absolute top-full mt-2 z-50 bg-echo text-insight rounded-lg p-4 w-[900px] space-y-4 border border-util-gray-03 shadow-lg"
  >
    <!-- Date range -->
    <div class="flex items-start">
      <label>Date range:</label>
      <DaterangePicker
        ref="datePickerComponentRef"
        class="w-full m-0"
        :hide-label="true"
        :initial-date-start="dateStart"
        :initial-date-end="dateEnd"
        :input-label-start="'Start date'"
        :input-label-end="'End date'"
        @emit-select-date-range="onSelectQueryDates"
      />
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
        class="flex-[4] min-w-0"
        :options="staticClasses ?? []"
        placeholder="Species - Sound..."
      />
      <SelectMultiple
        v-model="selectedValidation"
        class="flex-[1] min-w-0 ml-2"
        :options="staticOptions ?? []"
        placeholder="Validation"
      />
    </div>

    <!-- Classifications -->
    <div class="flex items-start">
      <label>Classifications:</label>
      <SelectMultiple
        v-model="selectedClassifications"
        class="flex-[4] min-w-0"
        :options="staticClassifications ?? []"
        placeholder="Classifications..."
      />
      <SelectMultiple
        v-model="selectedResults"
        class="flex-[1] min-w-0 ml-2"
        :options="staticOptions ?? []"
        placeholder="Results"
      />
    </div>

    <!-- Soundscape Composition -->
    <div class="flex items-start">
      <label class="w-32">Soundscape:</label>
      <SelectMultiple
        v-model="selectedSoundscapes"
        class="flex-[4] min-w-0"
        :options="staticSoundscapes ?? []"
        placeholder="Audio Classes"
      />
      <SelectMultiple
        v-model="selectedAnnotation"
        class="flex-[1] min-w-0 ml-2"
        :options="staticOptions ?? []"
        placeholder="Annotation"
      />
    </div>

    <!-- Buttons -->
    <div class="flex justify-between mt-4">
      <button
        class="btn btn-secondary btn-small text-sm px-[12px] h-[34px]"
        @click="resetFilters"
      >
        Reset filters
      </button>
      <button
        class="btn btn-primary btn-small text-sm px-[12px] h-[34px]"
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

import { type ClassesRecordingResponse, type ClassificationsResponse, type PlaylistResponse, type RecordingSearchParams, type SoundscapeResponse, type TagResponse } from '@rfcx-bio/common/api-arbimon/audiodata/recording'
import { type SiteResponse } from '@rfcx-bio/common/api-arbimon/audiodata/sites'
import { type GetRecordedMinutesPerDayResponse } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'

import { type DateRange } from '@/_components/date-range-picker/date-range-picker'
import DaterangePicker from '@/_components/date-range-picker/date-range-picker.vue'
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

const emit = defineEmits<{(e: 'apply', value: RecordingSearchParams): void, (e: 'resetFilters', value: RecordingSearchParams): void }>()
const props = defineProps<{
  dateRange: DateTime | undefined,
  sites: SiteResponse[] | undefined,
  playlists: PlaylistResponse[] | undefined,
  tags: TagResponse[] | undefined
  classes: ClassesRecordingResponse[] | undefined,
  soundscapes: SoundscapeResponse[] | undefined
  classifications: ClassificationsResponse[] | undefined
  recordedMinutesPerDay: GetRecordedMinutesPerDayResponse | undefined
  filtersData?: RecordingSearchParams | undefined
}>()

const datePickerComponentRef = ref<InstanceType<typeof DaterangePicker> | null>(null)

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
const classificationResults = computed<string[]>(() => {
  return selectedResults.value.map(r => {
    if (r === 'present') return JSON.stringify({ model: 1 })
    if (r === 'absent') return JSON.stringify({ model: 2 })
    return null
  }).filter((v): v is string => v !== null)
})
const selectedAnnotation = ref<(string)[]>([])
const staticOptions = [
  { icon: 'val-1', label: 'Present', value: 'present' },
  { icon: 'val-0', label: 'Absent', value: 'absent' }
]

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

const onSelectQueryDates = ({ dateStartLocalIso, dateEndLocalIso }: DateRange) => {
  filters.range = toRange(dateStartLocalIso, dateEndLocalIso)
}

const panelRef = ref<HTMLElement | null>(null)

function isFromFlowbiteDatepicker (el: Element | null) {
  return !!el?.closest('.datepicker, .datepicker-picker, .datepicker-dropdown')
}

function handleClickOutside (event: MouseEvent) {
  const el = event.target as Element
  if (isFromFlowbiteDatepicker(el)) return

  if (panelRef.value && !panelRef.value.contains(el)) {
    isOpen.value = false
  }
}

type RangeObj = { from: string; to: string }

function isRangeObj (value: unknown): value is RangeObj {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { from?: unknown; to?: unknown }
  return typeof v.from === 'string' && typeof v.to === 'string'
}

function parseRange (rangeStr?: string): RangeObj | undefined {
  if (!rangeStr) return undefined
  try {
    const obj: unknown = JSON.parse(rangeStr)
    if (isRangeObj(obj)) return obj
  } catch {
    // ignore
  }
  return undefined
}

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
  datePickerComponentRef.value?.resetDatePicker(parseRange(v?.range))

  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside)
  }, 0)
})

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

watch(selectedClassifications, (v) => { filters.classifications = v })
watch(selectedResults, () => { filters.classification_results = classificationResults.value })

watch(selectedSoundscapes, (v) => { filters.soundscape_composition = v })
watch(selectedAnnotation, (v) => { filters.soundscape_composition_annotation = v })

function emitApply () {
  emit('apply', filters)
}

function resetFilters () {
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
  datePickerComponentRef.value?.resetDatePicker()
  emit('resetFilters', filters)
}
</script>

<style scoped>
label {
  @apply w-32 min-w-32 mt-[11px] text-[14px] font-medium;
}
:deep(#dateRangePickerId input) {
  @apply bg-[#1e1c13] text-insight rounded-md text-sm font-medium;
}
:deep(#dateRangePickerId input::placeholder) {
  @apply text-insight text-sm font-medium;
}
:deep(#selectMultiple .input-select-multiple) {
  @apply bg-[#1e1c13] text-insight rounded-md py-[1px] font-medium;
}
:deep(#selectMultiple input) {
  @apply text-insight font-medium;
}

</style>
