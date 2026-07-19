<!--
  Full-year "density" date picker for the visualizer browse-by-site date control.

  Ports the legacy Arbimon `yearpick mode="density"` behavior (a2directives.js):
  a single popup showing ALL 12 months of the selected year at once, with each
  day cell tinted by how many recordings that day has, so a user can see the
  whole year's recording coverage at a glance and jump straight to any day.

  Density buckets match legacy exactly (verified against the live legacy DOM):
    0 recs        -> transparent (empty)
    1-49          -> white          (#ffffff)     "few"
    50-99         -> light green    (#dfffac)     "some"   (lighten(@frequency,25%))
    100+          -> arbimon green  (#ADFF2C)     "many"   (@frequency)
  Legend '+1 / +50 / +100' mirrors legacy.

  Replaced the former DateInputPicker in the visualizer sidebar: SAME props
  (initialDate, recordedMinutesPerDay, initialViewYear/Month, disabled) and SAME
  emits (emitSelectDate {dateLocalIso}, emitChangedYear {year}). Days with no
  recordings are disabled (not clickable), matching legacy `disable-empty`.
-->
<template>
  <div class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="btn btn-block w-full flex items-center justify-between gap-x-1 px-3 py-2 rounded-md border border-util-gray-02 text-insight bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span class="flex items-center gap-x-2 truncate">
        <icon-fa-calendar class="text-[12px]" />
        <span class="truncate">{{ displayDate || 'date' }}</span>
      </span>
      <icon-fa-chevron-down class="text-[10px]" />
    </button>

    <div
      v-if="isOpen"
      ref="popupRef"
      class="fixed z-[2000] bg-pitch border border-util-gray-03 rounded-md shadow-2xl p-3 text-insight"
      :style="popupStyle"
    >
      <!-- Year header + nav -->
      <div class="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          class="px-2 py-1 rounded hover:bg-util-gray-03 disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="!canPrevYear"
          @click="changeYear(-1)"
        >
          <icon-custom-chevron-left class="w-3 h-3" />
        </button>
        <div class="text-lg font-semibold">
          {{ viewYear }}
        </div>
        <button
          type="button"
          class="px-2 py-1 rounded hover:bg-util-gray-03 disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="!canNextYear"
          @click="changeYear(1)"
        >
          <icon-custom-chevron-right class="w-3 h-3" />
        </button>
      </div>

      <!-- 12-month grid: 4 columns x 3 rows -->
      <div class="grid grid-cols-4 gap-x-3 gap-y-2">
        <div
          v-for="month in months"
          :key="month.index"
          class="select-none"
        >
          <div
            class="text-center text-xs mb-1"
            :class="month.hasAny ? 'text-frequency' : 'text-util-gray-02'"
          >
            {{ month.label }}
          </div>
          <div class="grid grid-cols-7 gap-[1px]">
            <div
              v-for="wd in weekdayHeaders"
              :key="'wd-' + month.index + '-' + wd"
              class="text-[7px] leading-3 text-center text-util-gray-02"
            >
              {{ wd }}
            </div>
            <div
              v-for="(cell, ci) in month.cells"
              :key="'c-' + month.index + '-' + ci"
            >
              <button
                v-if="cell"
                type="button"
                class="w-full aspect-square flex items-center justify-center text-[9px] rounded-[2px] transition-colors"
                :class="[
                  cell.count > 0 ? 'cursor-pointer hover:ring-1 hover:ring-frequency' : 'cursor-not-allowed',
                  cell.selected ? 'ring-1 ring-frequency font-semibold' : '',
                  cell.textClass
                ]"
                :style="{ backgroundColor: cell.bg }"
                :disabled="cell.count === 0 || cell.disabled"
                :title="cell.count > 0 ? cell.iso + ' — ' + formatCount(cell.count) : cell.iso"
                @click="selectDay(cell)"
              >
                {{ cell.day }}
              </button>
              <div
                v-else
                class="w-full aspect-square"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Legend (matches legacy '+1 / +50 / +100') -->
      <div class="flex items-center gap-x-3 mt-3 px-1 text-[10px] text-util-gray-02">
        <span class="flex items-center gap-x-1">
          <span
            class="inline-block w-3 h-3 rounded-[2px] border border-util-gray-03"
            :style="{ backgroundColor: LEVEL_COLORS[1] }"
          /> +1
        </span>
        <span class="flex items-center gap-x-1">
          <span
            class="inline-block w-3 h-3 rounded-[2px]"
            :style="{ backgroundColor: LEVEL_COLORS[50] }"
          /> +50
        </span>
        <span class="flex items-center gap-x-1">
          <span
            class="inline-block w-3 h-3 rounded-[2px]"
            :style="{ backgroundColor: LEVEL_COLORS[100] }"
          /> +100
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { type GetRecordedMinutesPerDayResponse } from '@rfcx-bio/common/src/api-bio/cnn/recorded-minutes-per-day'

dayjs.extend(utc)

const props = defineProps<{
  initialDate?: string
  initialViewYear?: number
  initialViewMonth?: number
  recordedMinutesPerDay?: GetRecordedMinutesPerDayResponse
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'emitSelectDate', value: { dateLocalIso: string }): void
  (e: 'emitChangedYear', value: { year: string }): void
}>()

// Density bucket colors — verified against the live legacy calendar DOM.
const LEVEL_COLORS: Record<number, string> = {
  0: 'transparent',
  1: '#ffffff',
  50: '#dfffac',
  100: '#ADFF2C'
}
const bucketColor = (count: number): string => {
  if (count <= 0) return LEVEL_COLORS[0]
  if (count < 50) return LEVEL_COLORS[1]
  if (count < 100) return LEVEL_COLORS[50]
  return LEVEL_COLORS[100]
}
// White/light backgrounds need dark text; empty cells keep the light gray.
const textClassFor = (count: number): string => {
  if (count <= 0) return 'text-util-gray-02'
  return 'text-pitch'
}

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popupRef = ref<HTMLElement | null>(null)

// Position the (fixed) popup just below the trigger button, extending rightward
// over the spectrogram (like the legacy calendar). Clamp to the viewport so it
// is never pushed off-screen by the narrow sidebar column. Recomputed on open
// and on window resize/scroll.
const POPUP_W = 660
const popupStyle = ref<Record<string, string>>({})
const updatePopupPosition = (): void => {
  const el = triggerRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const margin = 8
  let left = r.left
  if (left + POPUP_W + margin > window.innerWidth) left = window.innerWidth - POPUP_W - margin
  if (left < margin) left = margin
  const top = Math.min(r.bottom + 4, window.innerHeight - 40)
  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${POPUP_W}px`,
    maxWidth: 'calc(100vw - 16px)',
    maxHeight: `${window.innerHeight - top - 12}px`,
    overflowY: 'auto'
  }
}

const weekdayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// counts keyed 'YYYY-MM-DD' (rec.date is already that format).
const countByDate = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  props.recordedMinutesPerDay?.forEach(rec => { out[rec.date] = rec.recordedMinutesCount })
  return out
})

const selectedIso = computed(() => (props.initialDate ? dayjs.utc(props.initialDate).format('YYYY-MM-DD') : ''))

const displayDate = computed(() => (props.initialDate ? dayjs.utc(props.initialDate).format('YYYY-MM-DD') : ''))

// The year to render. Prefer the selected date's year, else initialViewYear,
// else the year that actually has data, else now.
const dataYear = computed<number | undefined>(() => {
  const first = props.recordedMinutesPerDay?.[0]?.date
  return first ? dayjs(first).year() : undefined
})
const viewYear = ref<number>(new Date().getFullYear())
const syncViewYear = (): void => {
  if (selectedIso.value) viewYear.value = dayjs(selectedIso.value).year()
  else if (props.initialViewYear != null) viewYear.value = props.initialViewYear
  else if (dataYear.value != null) viewYear.value = dataYear.value
}
watch(() => [props.initialDate, props.initialViewYear, dataYear.value], syncViewYear, { immediate: true })

const maxYear = computed(() => new Date().getFullYear())
const canPrevYear = computed(() => true)
const canNextYear = computed(() => viewYear.value < maxYear.value)

interface DayCell { day: number, iso: string, count: number, bg: string, textClass: string, selected: boolean, disabled: boolean }
interface MonthBlock { index: number, label: string, hasAny: boolean, cells: (DayCell | null)[] }

const months = computed<MonthBlock[]>(() => {
  const y = viewYear.value
  const today = dayjs().endOf('day')
  const out: MonthBlock[] = []
  for (let m = 0; m < 12; m++) {
    const first = dayjs(new Date(y, m, 1))
    const daysInMonth = first.daysInMonth()
    const leading = first.day() // 0=Sun
    const cells: (DayCell | null)[] = []
    for (let i = 0; i < leading; i++) cells.push(null)
    let hasAny = false
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = dayjs(new Date(y, m, d)).format('YYYY-MM-DD')
      const count = countByDate.value[iso] ?? 0
      if (count > 0) hasAny = true
      cells.push({
        day: d,
        iso,
        count,
        bg: bucketColor(count),
        textClass: textClassFor(count),
        selected: iso === selectedIso.value,
        disabled: dayjs(iso).isAfter(today)
      })
    }
    out.push({ index: m, label: dayjs(new Date(y, m, 1)).format('MMM'), hasAny, cells })
  }
  return out
})

const formatCount = (count: number): string => `${count} recording${count === 1 ? '' : 's'}`

const toggleOpen = (): void => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    syncViewYear()
    updatePopupPosition()
  }
}

const changeYear = (delta: number): void => {
  const next = viewYear.value + delta
  if (next > maxYear.value) return
  viewYear.value = next
  emit('emitChangedYear', { year: String(next) })
}

const selectDay = (cell: DayCell): void => {
  if (cell.count === 0 || cell.disabled) return
  const dateLocalIso = cell.iso + 'T00:00:00.000Z'
  emit('emitSelectDate', { dateLocalIso })
  isOpen.value = false
}

const onDocClick = (e: MouseEvent): void => {
  const t = e.target as Node
  if (popupRef.value?.contains(t) || triggerRef.value?.contains(t)) return
  isOpen.value = false
}
const onReposition = (): void => { if (isOpen.value) updatePopupPosition() }
onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('resize', onReposition)
  window.removeEventListener('scroll', onReposition, true)
})

defineExpose({ close: () => { isOpen.value = false } })
</script>
