<template>
  <div
    class="bg-moss sidebar h-screen"
  >
    <div class="flex flex-row items-center justify-start gap-x-2 p-[15px]">
      <button
        class="btn btn-icon rounded-sm flex items-center text-insight bg-util-gray-04 border-util-gray-04 px-3.5
          hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :class="browserType === 'rec' ? 'text-insight bg-[#0a0a0a] border-[#0a0a0a]' : ''"
        title="Browse Recordings by Site"
      >
        <icon-fa-map-marker class="w-2 h-4" />
      </button>
      <button
        class="btn btn-icon rounded-sm flex items-center text-insight bg-util-gray-04 border-util-gray-04 hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :class="browserType === 'playlist' ? 'text-insight bg-[#0a0a0a] border-[#0a0a0a]' : ''"
        title="Browse Recordings by Playlist"
      >
        <icon-custom-fi-list class="w-3.5 h-4" />
      </button>
      <button
        class="btn btn-icon rounded-sm flex items-center text-insight bg-util-gray-04 border-util-gray-04 hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :class="browserType === 'soundscape' ? 'text-insight bg-[#0a0a0a] border-[#0a0a0a]' : ''"
        title="Show Soundscapes"
      >
        <icon-custom-fi-soundscape class="w-3.5 h-4" />
      </button>
    </div>
    <div class="flex flex-row items-center justify-start gap-x-2 px-[15px] pb-[15px] grid grid-cols-12 gap-4">
      <div class="col-span-7">
        <BasicSearchSelect
          v-model="siteSelected"
          :options="options"
          :show-map-icon="true"
          placeholder="Select site"
        />
      </div>
      <div class="col-span-5">
        <DateInputPicker
          :disabled="siteSelected === null || siteSelected === undefined"
          :initial-date="initialDate"
          :hide-label="true"
          :initial-view-year="initialDate ? undefined : initialViewYear"
          :initial-view-month="initialDate ? undefined : initialViewMonth"
          :recorded-minutes-per-day="recordedMinutesPerDay"
        />
      </div>
    </div>
    <SidebarThumbnail />
    <SidebarSpectrogramPlayer
      v-if="visobject"
      :visobject="visobject"
      :is-loading-visobject="isLoadingVisobject"
      :freq-filter="freqFilter"
      @emit-current-time="$emit('updateCurrentTime', $event)"
      @update-color-spectrogram="$emit('updateColorSpectrogram', $event)"
      @update-freq-filter="handleFreqFilter"
    />
    <SidebarTag
      v-if="visobject"
      :visobject="visobject"
      :is-adding-tag="isAddingTag || isRemovingTag"
      :project-tags="projectTags"
      :recording-tags="recordingTags"
      @emit-tag="handleRecTag"
      @emit-active-layer="toggleSidebarTag"
    />
    <SidebarTrainingSets
      v-if="visobject"
      :visobject="visobject"
      :training-set="trainingSetOptions"
    />
    <SidebarTemplates
      v-if="visobject"
      :visobject="visobject"
    />
    <alert-dialog
      v-if="showAlert"
      :severity="success"
      :title="title"
      :message="message"
    />
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { computed, inject, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import type { RecordingTagResponse, TagParams, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { type AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import DateInputPicker from '@/_components/date-range-picker/date-input-picker.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useLegacyTrainingSets } from '../../_composables/use-project'
import { type LegacyAvailableRecordFormatted, type LegacyYearlyRecord, useGetTags, useLegacyAvailableBySiteYear, useLegacyAvailableYearly } from '../../_composables/use-recordings'
import { useSites } from '../../_composables/use-sites'
import { useDeleteRecordingTag, useGetRecordingTag, usePutRecordingTag } from '../../_composables/use-visualizer'
import { type BboxGroup, type FreqFilter } from '../types'
import BasicSearchSelect from './basic-search-select.vue'
import SidebarSpectrogramPlayer from './sidebar-spectrogram-player.vue'
import SidebarTag from './sidebar-tag.vue'
import SidebarTemplates from './sidebar-templates.vue'
import SidebarThumbnail from './sidebar-thumbnail.vue'
import SidebarTrainingSets from './sidebar-training-sets.vue'

const props = defineProps<{
  visobject: Visobject | undefined
  isLoadingVisobject: boolean
}>()
const emits = defineEmits<{(e: 'updateCurrentTime', value: number): void,
  (e: 'updateColorSpectrogram', value: string): void,
  (e: 'updateFreqFilter', value: FreqFilter): void,
  (e: 'updateTags'): void,
  (e: 'emitActiveLayer', value: string | undefined): void,
}>()

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const route = useRoute()
const store = useStore()

const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
// const layers: string[] = ['tag', 'species', 'template', 'aed', 'cluster']
const activeLayer = ref<string | undefined>(undefined)
const freqFilter = ref<FreqFilter | undefined>(undefined)
const selectedProjectSlug = computed(() => store.project?.slug)
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType as string : undefined)
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)
const spectrogramTags = ref<BboxGroup[]>([])
const initialDate = ref('')
const initialViewMonth = ref<number | undefined>(undefined)
const initialViewYear = ref<number | undefined>(undefined)

const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

const { data: projectTags, refetch: refetchProjectTags } = useGetTags(apiClientArbimon, selectedProjectSlug)
const { data: recordingTags, refetch: refetchRecordingTags } = useGetRecordingTag(apiClientArbimon, selectedProjectSlug, browserTypeId)
const { isPending: isAddingTag, mutate: mutateRecordingTag } = usePutRecordingTag(apiClientArbimon, selectedProjectSlug, browserTypeId)
const { isPending: isRemovingTag, mutate: mutateDeleteRecordingTag } = useDeleteRecordingTag(apiClientArbimon, selectedProjectSlug, browserTypeId)
const { data: sites } = useSites(apiClientArbimon, selectedProjectSlug, computed(() => ({ count: true, deployment: true, logs: true })))
const { data: trainingSetOptions } = useLegacyTrainingSets(apiClientArbimon, selectedProjectSlug)

const options = computed(() => sites.value?.map(s => ({ label: s.name, value: s.id, count: s.rec_count })) ?? [])
const siteSelected = ref<string | number | undefined>(undefined)
const siteSelectedValue = computed(() => siteSelected.value)

const { data: yearly } = useLegacyAvailableYearly(apiClientArbimon, selectedProjectSlug, siteSelectedValue)
const yearSelected = computed(() => getYearWithMaxCount(yearly.value ?? []))
const { data: recordedMinutesPerDay } = useLegacyAvailableBySiteYear(apiClientArbimon, selectedProjectSlug, siteSelectedValue, yearSelected)

function getYearWithMaxCount (records: LegacyYearlyRecord[]): number {
  if (records == null || records.length === 0) {
    return dayjs().year()
  }

  const maxRec = records.reduce((max, curr) =>
    curr.recordedMinutesCount > max.recordedMinutesCount ? curr : max
  )

  return maxRec.year
}

function getFirstRecordedDateOfYear (
  records: LegacyAvailableRecordFormatted[],
  year?: number
): string {
  if (records == null || records.length === 0) {
    return dayjs().format('DD-MM-YYYY')
  }

  const filtered = year != null && !Number.isNaN(year)
    ? records.filter(r => dayjs(r.date).year() === year)
    : records

  const sorted = filtered.length > 0 ? filtered : records

  const first = sorted.reduce((min, curr) =>
    curr.date < min.date ? curr : min
  )

  return first.date
}

watchEffect(() => {
  if (recordedMinutesPerDay.value && recordedMinutesPerDay.value.length > 0) {
    const firstRecordedDate = getFirstRecordedDateOfYear(recordedMinutesPerDay.value)
    const [year, month] = firstRecordedDate.split('-')
    initialViewYear.value = Number(year)
    initialViewMonth.value = Number(month)
  }
})

const handleFreqFilter = (filter: FreqFilter) => {
  emits('updateFreqFilter', filter)
  freqFilter.value = filter
}
const handleRecTag = (tagIds: TagParams[]) => {
  if (recordingTags.value === undefined) return
  const arrIds = tagIds.map(t => t.id)
  const tagsToDelete = recordingTags.value.filter((tag: RecordingTagResponse) => !arrIds.includes(tag.tag_id))
  const oldTags = recordingTags.value.map(t => t.tag_id)
  const tagsToAdd = arrIds.filter((id: number) => !oldTags.includes(id))
  if (tagsToAdd.length) {
    mutateRecordingTag(tagsToAdd.map(recId => { return { id: recId } })[0], {
      onSuccess: async () => {
        refetchProjectTags()
        refetchRecordingTags()
        showAlertDialog('success', 'Success', 'Tag added')
        emits('updateTags')
      },
      onError: (err) => {
        console.info('err', err)
        showAlertDialog('error', 'Error', 'Error adding tag')
      }
    })
  }
  if (tagsToDelete.length) {
    mutateDeleteRecordingTag(tagsToDelete[0], {
      onSuccess: async () => {
        refetchProjectTags()
        refetchRecordingTags()
        showAlertDialog('success', 'Success', 'Tag removed')
        emits('updateTags')
      },
      onError: (err) => {
        console.info('err', err)
        showAlertDialog('error', 'Error', 'Error removing tag')
      }
    })
  }
}

const toggleSidebarTag = (isActive: boolean) => {
  activeLayer.value = isActive ? 'tag' : undefined
  emits('emitActiveLayer', activeLayer.value)
}

const groupByBbox = (tags: RecordingTagResponse[]): BboxGroup[] => {
  const map: Record<string, BboxGroup> = {}
  for (const tag of tags) {
    if (tag.f0 != null && tag.f1 != null) {
      const key = [tag.t0, tag.f0, tag.t1, tag.f1].join(',')
      if (map[key] === undefined) map[key] = { bbox: tag, tags: [] }
      map[key].tags.push(tag)
    }
  }
  return Object.values(map)
}

watch(() => recordingTags.value, () => {
  if (!recordingTags.value) return
  spectrogramTags.value = groupByBbox(recordingTags.value)
})

watch(() => props.visobject, (v) => {
  const site = options.value.find(s => s.label === v?.site)
  siteSelected.value = site?.value
  initialDate.value = v?.datetime ?? ''
})
</script>

<style lang="scss">
  .sidebar {
    min-height: 1px;
    position: absolute;
    max-width: 400px;
    width: 100%;
    z-index: 10;
    border: 1px solid #7F7D78;
    background-color: #1e1c13;
    left: 51px;
    right: auto;
    top: 0;
    bottom: 0;
  }
</style>
