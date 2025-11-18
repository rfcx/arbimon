<template>
  <div
    class="bg-moss sidebar h-screen overflow-y-scroll"
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
    <div
      v-if="isPlaylist"
      class="flex flex-col w-full px-[15px] pb-[15px]"
    >
      <BasicSearchSelect
        v-model="playlistSelected"
        class="w-full"
        :options="optionsPlaylist"
        :show-list-icon="true"
        placeholder="Select Playlist"
      />
      <PaginationControl
        v-model="page"
        class="w-full"
        :total-items="totalItems"
        :page-size="pageSize"
        :block-size="7"
        @change="onPageChange"
      />
    </div>
    <div
      v-else
      class="flex flex-row items-center justify-start gap-x-2 px-[15px] pb-[15px] grid grid-cols-12 gap-4"
    >
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
    <SidebarThumbnail
      :recordings-item="recordingResponse"
      @on-selected-thumbnail="onSelectedThumbnail"
    />
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
    <SidebarSpecies
      v-if="visobject"
      :visobject="visobject"
      @emit-species-visibility="$emit('emitSpeciesVisibility', $event)"
    />
    <SidebarTrainingSets
      v-if="visobject"
      @emit-active-layer="toggleSidebarTrainingSet"
      @emit-training-set="$emit('emitTrainingSet', $event)"
      @emit-training-set-visibility="$emit('emitTrainingSetVisibility', $event)"
    />
    <SidebarTemplates
      v-if="visobject"
      :visobject="visobject"
      @emit-template-visibility="$emit('emitTemplateVisibility', $event)"
      @emit-active-layer="toggleSidebarTemplate"
    />
    <SidebarSoundscape
      v-if="visobject"
      :visobject="visobject"
      :soundscape-response="soundscape"
      @on-emit-validation="handleAction"
    />
    <SidebarAudioEvents
      v-if="visobject"
      :visobject="visobject"
      :aed-clustering="aedClustering"
      :playlist="playlist"
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
import { computed, inject, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import type { RecordingResponse, RecordingTagResponse, TagParams, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import { apiArbimonPostPlaylistItems } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import type { TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { type AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import DateInputPicker from '@/_components/date-range-picker/date-input-picker.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { type LegacyAvailableRecordFormatted, type LegacyYearlyRecord, useGetPlaylists, useGetSoundscape, useGetTags, useLegacyAvailableBySiteYear, useLegacyAvailableYearly } from '../../_composables/use-recordings'
import { useSites } from '../../_composables/use-sites'
import { useAedClustering, useDeleteRecordingTag, useGetPlaylistInfo, useGetRecordingTag, usePostSoundscapeComposition, usePutRecordingTag } from '../../_composables/use-visualizer'
import { type BboxGroupTags, type FreqFilter } from '../types'
import BasicSearchSelect from './basic-search-select.vue'
import PaginationControl from './pagination-control.vue'
import SidebarAudioEvents from './sidebar-audio-events.vue'
import SidebarSoundscape from './sidebar-soundscape.vue'
import SidebarSpecies from './sidebar-species.vue'
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
  (e: 'emitTrainingSet', value: TrainingSet): void,
  (e: 'emitTrainingSetVisibility', value: boolean): void,
  (e: 'emitSpeciesVisibility', value: boolean): void,
  (e: 'emitTemplateVisibility', value: boolean): void,
  (e: 'emitSelectedThumbnail', value: number): void,
  (e: 'emitSelectedPlaylist', value: number): void
}>()

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const route = useRoute()
const store = useStore()

const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
const activeLayer = ref<string | undefined>(undefined)
const freqFilter = ref<FreqFilter | undefined>(undefined)
const selectedProjectSlug = computed(() => store.project?.slug)
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType as string : undefined)
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const browserRecId = computed(() => route.params.browserRecId as string ?? undefined)
const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)
const spectrogramTags = ref<BboxGroupTags[]>([])
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

const isPlaylist = computed(() => browserType.value === 'playlist')

const { data: projectTags, refetch: refetchProjectTags } = useGetTags(apiClientArbimon, selectedProjectSlug)
const { data: recordingTags, refetch: refetchRecordingTags } = useGetRecordingTag(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { isPending: isAddingTag, mutate: mutateRecordingTag } = usePutRecordingTag(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { isPending: isRemovingTag, mutate: mutateDeleteRecordingTag } = useDeleteRecordingTag(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { data: sites } = useSites(apiClientArbimon, selectedProjectSlug, computed(() => ({ count: true, deployment: true, logs: true })))
const { data: soundscape, refetch: refetchGetSoundscapeComposition } = useGetSoundscape(apiClientArbimon, selectedProjectSlug)
const { mutate: mutatePostSoundscapeComposition } = usePostSoundscapeComposition(apiClientArbimon, selectedProjectSlug, browserTypeId.value as string)

const playlistSelected = ref<number | undefined>(undefined)
const playlistSelectedValue = computed(() => playlistSelected.value)

const playlistId = computed(() =>
  playlistSelectedValue.value ?? (isPlaylist.value ? browserTypeId.value : undefined)
)

const { data: aedClustering } = useAedClustering(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : undefined)
const { data: playlist } = useGetPlaylistInfo(apiClientArbimon, selectedProjectSlug, playlistId)
const { data: playlists } = useGetPlaylists(apiClientArbimon, selectedProjectSlug)

const options = computed(() => sites.value?.map(s => ({ label: s.name, value: s.id, count: s.rec_count })) ?? [])
const optionsPlaylist = computed(() => playlists.value?.map(p => ({ label: p.name, value: p.id, count: p.count })) ?? [])
const siteSelected = ref<string | number | undefined>(undefined)
const siteSelectedValue = computed(() => siteSelected.value)

const { data: yearly } = useLegacyAvailableYearly(apiClientArbimon, selectedProjectSlug, siteSelectedValue)
const yearSelected = computed(() => getYearWithMaxCount(yearly.value ?? []))
const { data: recordedMinutesPerDay } = useLegacyAvailableBySiteYear(apiClientArbimon, selectedProjectSlug, siteSelectedValue, yearSelected)

const page = ref(0)
const pageSize = 10
const totalItems = computed(() => playlist?.value?.count ?? 0)

const recordingResponse = ref<RecordingResponse | undefined>(undefined)

async function onPageChange (p: number) {
  page.value = p
  recordingResponse.value = await apiArbimonPostPlaylistItems(apiClientArbimon, selectedProjectSlug.value ?? '', playlistSelectedValue.value, { offset: (p * pageSize), limit: pageSize })
}

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
  if (recordedMinutesPerDay.value !== undefined && recordedMinutesPerDay.value.length > 0) {
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

const onSelectedThumbnail = (idR: number) => {
 emits('emitSelectedThumbnail', idR)
}

const toggleSidebarTrainingSet = (isActive: boolean, type: string) => {
  activeLayer.value = isActive ? type : undefined
  emits('emitActiveLayer', activeLayer.value)
}

const toggleSidebarTemplate = (isActive: boolean) => {
  activeLayer.value = isActive ? 'template' : undefined
  emits('emitActiveLayer', activeLayer.value)
}

const groupByBbox = (tags: RecordingTagResponse[]): BboxGroupTags[] => {
  const map: Record<string, BboxGroupTags> = {}
  for (const tag of tags) {
    if (tag.f0 != null && tag.f1 != null) {
      const key = [tag.t0, tag.f0, tag.t1, tag.f1].join(',')
      if (map[key] === undefined) map[key] = { bbox: tag, tags: [] }
      map[key].tags.push(tag)
    }
  }
  return Object.values(map)
}

function handleAction (cl: number, val: number) {
  mutatePostSoundscapeComposition({
    class: cl.toString(),
    val
   }, {
    onSuccess: () => {
      refetchGetSoundscapeComposition()
      showAlertDialog('success', 'Success', 'Soundscape composition class is updated')
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error updating Soundscape composition class')
    }
  })
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

onMounted(() => {
  if (isPlaylist.value && browserTypeId.value !== undefined) {
    playlistSelected.value = Number(browserTypeId.value)
  }
})

watch(siteSelected, (newVal, oldVal) => {
  if (oldVal === undefined) return
  if (newVal !== oldVal) {
    initialDate.value = ''
  }
})

watch(playlistSelectedValue, async (val) => {
  if (val === undefined) return
  emits('emitSelectedPlaylist', val)
  recordingResponse.value = await apiArbimonPostPlaylistItems(apiClientArbimon, selectedProjectSlug.value ?? '', val, { offset: (page.value * pageSize), limit: pageSize })
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
