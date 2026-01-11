<template>
  <div
    class="bg-moss fixed sidebar h-screen overflow-y-scroll"
  >
    <div class="flex flex-row items-center justify-start gap-x-2 p-[15px]">
      <button
        class="btn btn-icon rounded-sm flex items-center text-insight bg-util-gray-04 border-util-gray-04 px-3.5
          hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :class="browserType === 'rec' ? 'text-insight bg-[#0a0a0a] border-[#0a0a0a]' : ''"
        title="Browse Recordings by Site"
        @click="setBrowserType('rec')"
      >
        <icon-fa-map-marker class="w-2 h-4" />
      </button>
      <button
        class="btn btn-icon rounded-sm flex items-center text-insight bg-util-gray-04 border-util-gray-04 hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :class="browserType === 'playlist' ? 'text-insight bg-[#0a0a0a] border-[#0a0a0a]' : ''"
        title="Browse Recordings by Playlist"
        @click="setBrowserType('playlist')"
      >
        <icon-custom-fi-list class="w-3.5 h-4" />
      </button>
      <button
        class="btn btn-icon rounded-sm flex items-center text-insight bg-util-gray-04 border-util-gray-04 hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :class="browserType === 'soundscape' ? 'text-insight bg-[#0a0a0a] border-[#0a0a0a]' : ''"
        title="Show Soundscapes"
        @click="setBrowserType('soundscape')"
      >
        <icon-custom-fi-soundscape class="w-3.5 h-4" />
      </button>
    </div>
    <div v-show="isPlaylist || isSite">
      <div
        v-if="isPlaylist"
        class="flex flex-col w-full px-[15px] pb-[15px]"
      >
        <BasicSearchSelect
          v-model="playlistSelected"
          class="w-full text-sm font-medium"
          :options="optionsPlaylist"
          :show-list-icon="true"
          :w-full="true"
          placeholder="Select Playlist"
        />
        <PaginationControl
          v-if="totalItems > 10"
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
            class="text-sm font-medium"
            :options="options"
            :show-map-icon="true"
            width-class="w-80"
            placeholder="Select site"
          />
        </div>
        <div class="col-span-5">
          <DateInputPicker
            ref="datePickerRef"
            :disabled="siteSelected === null || siteSelected === undefined"
            :initial-date="initialDate"
            :hide-label="true"
            :initial-view-year="initialViewYear"
            :initial-view-month="initialViewMonth"
            :recorded-minutes-per-day="recordedMinutesPerDay"
            @emit-select-date="onEmitSelectedDate"
            @emit-changed-year="onEmitChangeYear"
          />
        </div>
      </div>
    </div>
    <SidebarThumbnail
      :recordings-item="recordingResponse"
      :soundscape-response="soundscapeResponse"
      :initial-date="initialDate"
      :site-selected="siteSelected"
      :visobject="visobject"
      :next-recording="nextRecording"
      :prev-recording="prevRecording"
      @on-selected-thumbnail="onSelectedThumbnail"
    />
    <div v-show="isPlaylist || isSite">
      <SidebarSpectrogramPlayer
        v-if="visobject"
        :visobject="visobject"
        :is-loading-visobject="isLoadingVisobject"
        :freq-filter="freqFilter"
        :pointer="props.pointer"
        @emit-current-time="$emit('updateCurrentTime', $event)"
        @next-recording="setNextRecording"
        @prev-recording="setPrevRecording"
        @update-color-spectrogram="$emit('updateColorSpectrogram', $event)"
        @update-freq-filter="handleFreqFilter"
      />
      <SidebarTag
        v-if="visobject"
        :visobject="visobject"
        :is-adding-tag="isAddingTag || isRemovingTag"
        :project-tags="projectTags"
        :recording-tags="recordingTags"
        :current-tab="currentOpenTab"
        @emit-tags="handleRecTags"
        @emit-active-layer="toggleSidebarTag"
        @emit-closed-tabs="handleClosedTabs"
      />
      <SidebarSpecies
        v-if="visobject"
        :visobject="visobject"
        @emit-species-visibility="$emit('emitSpeciesVisibility', $event)"
        @update-validations="$emit('updateValidations')"
        @emit-closed-tabs="handleClosedTabs"
      />
      <SidebarTrainingSets
        v-if="visobject"
        :current-tab="currentOpenTab"
        @emit-active-layer="toggleSidebarTrainingSet"
        @emit-training-set="$emit('emitTrainingSet', $event)"
        @emit-training-set-visibility="$emit('emitTrainingSetVisibility', $event)"
        @emit-closed-tabs="handleClosedTabs"
      />
      <SidebarTemplates
        v-if="visobject"
        :current-tab="currentOpenTab"
        :visobject="visobject"
        @emit-template-visibility="$emit('emitTemplateVisibility', $event)"
        @emit-active-layer="toggleSidebarTemplate"
        @emit-closed-tabs="handleClosedTabs"
      />
      <SidebarSoundscape
        v-if="visobject"
        :visobject="visobject"
        :soundscape-response="soundscape"
        :soundscape-composition="soundscapeComposition"
        @on-emit-validation="onEmitSounscapeValidation"
        @emit-closed-tabs="handleClosedTabs"
      />
      <SidebarAudioEvents
        v-if="visobject"
        :visobject="visobject"
        :aed-jobs="audioEventJobs"
        :clustering-playlists="clusteringPlaylists"
        @emit-active-aed-layer="$emit('emitActiveLayer', 'aed')"
        @emit-active-aed-boxes="onEmitActiveAedBoxes"
        @emit-active-clustering="onEmitActiveClustering"
        @emit-closed-tabs="handleClosedTabs"
      />
    </div>
    <div v-show="isSoundscape">
      <SoundscapeDetails
        v-if="soundscapeSelected"
        :item="soundscapeSelected"
      />
      <SoundscapeRegions
        v-if="soundscapeSelected"
        @emit-active-layer="toggleSoundscapeRegions"
        @emit-visible-soundscapes="$emit('emitVisibleSoundscapes', $event)"
      />
    </div>
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
import { computed, inject, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import type { RecordingResponse, RecordingTagResponse, SoundscapeItem, SoundscapeResponse, TagParams, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import { apiArbimonPostPlaylistItems, apiGetSoundscapes } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import type { TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { type AlertDialogType } from '@/_components/alert-dialog.vue'
import alertDialog from '@/_components/alert-dialog.vue'
import DateInputPicker from '@/_components/date-range-picker/date-input-picker.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { type LegacyAvailableRecordFormatted, type LegacyYearlyRecord, useGetPlaylists, useGetSoundscape, useGetTags, useLegacyAvailableBySiteYear, useLegacyAvailableYearly } from '../../_composables/use-recordings'
import { useSites } from '../../_composables/use-sites'
import { useDeleteRecordingTag, useGetAed, useGetClustering, useGetPlaylistInfo, useGetRecordingTag, useGetSoundscapeComposition, usePostSoundscapeComposition, usePutRecordingTag } from '../../_composables/use-visualizer'
import { type BboxGroupTags, type FreqFilter } from '../types'
import BasicSearchSelect from './basic-search-select.vue'
import PaginationControl from './pagination-control.vue'
import SidebarAudioEvents from './sidebar-audio-events.vue'
import SidebarSoundscape from './sidebar-soundscape.vue'
import SoundscapeDetails from './sidebar-soundscape-details.vue'
import SoundscapeRegions, { type VisibleSoundscapes } from './sidebar-soundscape-regions.vue'
import SidebarSpecies from './sidebar-species.vue'
import SidebarSpectrogramPlayer from './sidebar-spectrogram-player.vue'
import SidebarTag from './sidebar-tag.vue'
import SidebarTemplates from './sidebar-templates.vue'
import SidebarThumbnail from './sidebar-thumbnail.vue'
import SidebarTrainingSets from './sidebar-training-sets.vue'
import { type Pointer } from './visualizer-spectrogram.vue'

export interface AedJob {
  jobId: number
  name: string
  parametersText: string
  visible: boolean
  timestamp: string
  items: {
    aedId: number
    name: string
    recId: number
    x1: number
    x2: number
    y1: number
    y2: number
    jobId: number | null
    display: string
    borderColor: string
    backgroundColor: string
    opacity: number
  }[]
}

export interface ClusteringPlaylist {
  recId: number
  playlistName: string
  playlistId: number
  count: number
  visible: boolean
  items: {
    recId: number
    aedId: number
    x1: number
    x2: number
    y1: number
    y2: number
    playlistId: number | null
    playlistName: string
    display: string
    borderColor: string
    backgroundColor: string
    opacity: number
  }[]
}

const props = defineProps<{
  visobject: Visobject | undefined
  isLoadingVisobject: boolean
  pointer: Pointer
  isSidebarTagsUpdated: boolean
}>()

const emits = defineEmits<{(e: 'updateCurrentTime', value: number): void,
  (e: 'updateColorSpectrogram', value: string): void,
  (e: 'updateValidations'): void,
  (e: 'updateFreqFilter', value: FreqFilter): void,
  (e: 'updateTags'): void,
  (e: 'emitActiveLayer', value: string | undefined): void,
  (e: 'emitTrainingSet', value: TrainingSet): void,
  (e: 'emitTrainingSetVisibility', value: boolean): void,
  (e: 'emitSpeciesVisibility', value: boolean): void,
  (e: 'emitTemplateVisibility', value: boolean): void,
  (e: 'emitVisibleSoundscapes', value: VisibleSoundscapes): void,
  (e: 'emitSelectedThumbnail', value: number): void,
  (e: 'emitSelectedPlaylist', value: number): void,
  (e: 'emitActiveAedBoxes', visibleJobs: Record<number, boolean>, job: AedJob): void,
  (e: 'emitActiveClustering', visiblePl: Record<number, boolean>, pl: ClusteringPlaylist): void,
  (e: 'emitSetBrowserType', value: string): void
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
const currentOpenTab = ref('')
const initialViewMonth = ref<number | undefined>(undefined)
const initialViewYear = ref<number | undefined>(undefined)
const nextRecording = ref<boolean>(false)
const prevRecording = ref<boolean>(false)
const audioEventJobs: Record<string, AedJob> = {}
const clusteringPlaylists: Record<string, ClusteringPlaylist> = {}

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
const isSite = computed(() => browserType.value === 'rec')
const isSoundscape = computed(() => browserType.value === 'soundscape')

const idRecording = ref(0)

const selectedRecordingId = computed(() => {
  return isPlaylist.value ? isSoundscape.value ? undefined : browserRecId.value : browserTypeId.value
})

const { data: projectTags, refetch: refetchProjectTags } = useGetTags(apiClientArbimon, selectedProjectSlug)
const { data: recordingTags, refetch: refetchRecordingTags } = useGetRecordingTag(apiClientArbimon, selectedProjectSlug, selectedRecordingId)
const { isPending: isAddingTag, mutate: mutateRecordingTag } = usePutRecordingTag(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { isPending: isRemovingTag, mutate: mutateDeleteRecordingTag } = useDeleteRecordingTag(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { data: sites } = useSites(apiClientArbimon, selectedProjectSlug, computed(() => ({ count: true, deployment: true, logs: true })))
const { data: soundscape, refetch: refetchGetSoundscape } = useGetSoundscape(apiClientArbimon, selectedProjectSlug)
const { data: soundscapeComposition, refetch: refetchGetSoundscapeComposition } = useGetSoundscapeComposition(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { mutate: mutatePostSoundscapeComposition } = usePostSoundscapeComposition(apiClientArbimon, selectedProjectSlug, browserTypeId.value as string)

const playlistSelected = ref<number | undefined>(undefined)
const playlistSelectedValue = computed(() => playlistSelected.value)

const playlistId = computed(() =>
  playlistSelectedValue.value ?? (isPlaylist.value ? browserTypeId.value : undefined)
)

const { data: auduoEventDetections } = useGetAed(apiClientArbimon, selectedProjectSlug, selectedRecordingId)
const { data: clustering } = useGetClustering(apiClientArbimon, selectedProjectSlug, isPlaylist.value ? browserRecId : browserTypeId)
const { data: playlist } = useGetPlaylistInfo(apiClientArbimon, selectedProjectSlug, playlistId)
const { data: playlists } = useGetPlaylists(apiClientArbimon, selectedProjectSlug)

const options = computed(() => sites.value?.map(s => ({ label: s.name, value: s.id, count: s.rec_count })) ?? [])
const optionsPlaylist = computed(() => playlists.value?.map(p => ({ label: p.name, value: p.id, count: p.count })) ?? [])
const siteSelected = ref<string | number | undefined>(undefined)
const siteSelectedValue = computed(() => siteSelected.value)

const { data: yearly } = useLegacyAvailableYearly(apiClientArbimon, selectedProjectSlug, siteSelectedValue)
const viewedYear = ref<number | undefined>(undefined)
const yearSelected = computed(() => getYearWithMaxCount(yearly.value ?? [], viewedYear.value))
const { data: recordedMinutesPerDay, refetch: refetchAvailableBySiteYear } = useLegacyAvailableBySiteYear(apiClientArbimon, selectedProjectSlug, siteSelectedValue, yearSelected)

const page = ref(0)
const pageSize = 10
const totalItems = computed(() => playlist?.value?.count ?? 0)

const recordingResponse = ref<RecordingResponse | undefined>(undefined)
const soundscapeResponse = ref<SoundscapeResponse | undefined>(undefined)
const soundscapeSelected = ref<SoundscapeItem | undefined>(undefined)

async function onPageChange (p: number) {
  page.value = p
  recordingResponse.value = await apiArbimonPostPlaylistItems(apiClientArbimon, selectedProjectSlug.value ?? '', playlistSelectedValue.value, { offset: (p * pageSize), limit: pageSize })
}

function getYearWithMaxCount (records: LegacyYearlyRecord[], viewedYear?: number): number {
  if (viewedYear !== undefined) return viewedYear
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

const datePickerRef = ref<InstanceType<typeof DateInputPicker> | null>(null)

const onEmitSelectedDate = (date: { dateLocalIso: string }) => {
  initialDate.value = date.dateLocalIso

  nextTick(() => {
    const input = (datePickerRef.value as any)?.$refs?.datePickerInput as HTMLInputElement | undefined
    input?.blur()
  })
}

const onEmitChangeYear = (date: { year: string }) => {
  if (yearly.value === undefined) return
  if (yearly.value?.filter(d => d.year === +date.year).length > 0) {
    viewedYear.value = +date.year
    refetchAvailableBySiteYear()
  }
}

const handleClosedTabs = (tab: string) => {
  currentOpenTab.value = tab
}

const handleFreqFilter = (filter: FreqFilter) => {
  emits('updateFreqFilter', filter)
  freqFilter.value = filter
}

const handleRecTags = (tagIds: TagParams[]) => {
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

const setBrowserType = async (type: string) => {
  emits('emitSetBrowserType', type)
  if (type === 'soundscape') {
    soundscapeResponse.value = await apiGetSoundscapes(apiClientArbimon, selectedProjectSlug.value ?? '')
    if (browserTypeId.value !== undefined) {
      soundscapeSelected.value = soundscapeResponse.value?.find(it => it.id === Number(browserTypeId.value)) ?? undefined
    }
  }
}

const setNextRecording = () => {
  nextRecording.value = true
  setTimeout(() => {
    nextRecording.value = false
  }, 1000)
}

const setPrevRecording = () => {
  prevRecording.value = true
  setTimeout(() => {
    prevRecording.value = false
  }, 1000)
}

const onSelectedThumbnail = (idItem: number) => {
  if (isSoundscape.value) {
    soundscapeSelected.value = soundscapeResponse.value?.find(it => it.id === idItem) ?? undefined
  } else {
    idRecording.value = idItem
  }
  emits('emitSelectedThumbnail', idItem)
}

const toggleSidebarTrainingSet = (isActive: boolean, type: string) => {
  activeLayer.value = isActive ? type : undefined
  emits('emitActiveLayer', activeLayer.value)
}

const toggleSidebarTemplate = (isActive: boolean) => {
  activeLayer.value = isActive ? 'template' : undefined
  emits('emitActiveLayer', activeLayer.value)
}

const toggleSoundscapeRegions = (isActive: boolean) => {
  activeLayer.value = isActive ? 'Soundscape Regions' : undefined
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

const onEmitSounscapeValidation = (cl: number, val: number) => {
  mutatePostSoundscapeComposition({
    class: cl.toString(),
    val
   }, {
    onSuccess: () => {
      refetchGetSoundscapeComposition()
      refetchGetSoundscape()
      showAlertDialog('success', 'Success', 'Soundscape composition class is updated')
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error updating Soundscape composition class')
    }
  })
}

const onEmitActiveAedBoxes = (visibleJobs: Record<number, boolean>, job: AedJob) => {
  emits('emitActiveAedBoxes', visibleJobs, job)
}

const onEmitActiveClustering = (visiblePl: Record<number, boolean>, pl: ClusteringPlaylist) => {
  emits('emitActiveClustering', visiblePl, pl)
}

const formatParameters = (params: Record<string, number>): string => {
  return Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join(', ')
}

const hexToRGB = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')'
}

const fetchAudioEvents = () => {
  if (auduoEventDetections.value === undefined) return
  let isAudioEventsPlaylist = false
  let selectedAudioEventJob: string | null = null
  try {
    selectedAudioEventJob = localStorage.getItem('analysis.audioEventJob')
    isAudioEventsPlaylist = !isNaN(Number(selectedAudioEventJob))
  } catch (e) {}
  const colors = ['#5340ff33', '#008000', '#ffcd00', '#1F57CC', '#53ff40', '#5bc0de', '#5340ff33']
  for (const item of auduoEventDetections.value) {
    const key = String(item.name)
    if (!(key in audioEventJobs)) {
      audioEventJobs[key] = {
        jobId: item.job_id,
        name: item.name,
        parametersText: formatParameters(item.parameters),
        // job not visible by default, except selected job from the audio events details page
        visible: isAudioEventsPlaylist ? Number(selectedAudioEventJob) === item.job_id : false,
        timestamp: item.timestamp,
        items: []
      }
    }
    audioEventJobs[key].items.push({
      aedId: item.aed_id,
      name: item.name,
      recId: item.rec_id,
      x1: item.time_min,
      x2: item.time_max,
      y1: item.freq_min,
      y2: item.freq_max,
      jobId: item.job_id || null,
      display: item.rec_id === +browserTypeId.value ? 'block' : 'none',
      borderColor: '',
      backgroundColor: '',
      // boxes not visible by default, except selected job from the audio events details page
      opacity: isAudioEventsPlaylist ? (Number(selectedAudioEventJob) === item.job_id ? 1 : 0) : 0
    })
  }
  const jobs = Object.values(audioEventJobs)
  for (const [ind, job] of jobs.entries()) {
    const color = colors[ind] || colors[0]
    job.items.forEach((item: any) => {
      item.borderColor = hexToRGB(color, 0.9)
      item.backgroundColor = hexToRGB(color, 0.1)
    })
  }
}

const fetchClustering = () => {
  if (clustering.value === undefined) return
  const colors = ['#5340ff33', '#008000', '#ffcd00', '#1F57CC', '#53ff40', '#5bc0de', '#5340ff33']
  for (const item of clustering.value) {
    const key = String(item.playlist_id)
    if (!(key in clusteringPlaylists)) {
      clusteringPlaylists[key] = {
        recId: item.recording_id,
        playlistName: item.playlist_name,
        playlistId: item.playlist_id,
        count: 1,
        // playlist is hidden by default
        visible: false,
        items: []
      }
    } else clusteringPlaylists[key].count += 1
    clusteringPlaylists[key].items.push({
      recId: item.recording_id,
      aedId: item.aed_id,
      x1: item.time_min,
      x2: item.time_max,
      y1: item.frequency_min,
      y2: item.frequency_max,
      playlistId: item.playlist_id || null,
      playlistName: item.playlist_name,
      display: item.recording_id === (isPlaylist.value ? +browserRecId.value : +browserTypeId.value) ? 'block' : 'none',
      borderColor: '',
      backgroundColor: '',
      // boxes not visible by default
      opacity: 0
    })
  }
  const jobs = Object.values(clusteringPlaylists)
  for (const [ind, job] of jobs.entries()) {
    const color = colors[ind] || colors[0]
    job.items.forEach((item: any) => {
      item.borderColor = hexToRGB(color, 0.4)
      item.backgroundColor = hexToRGB(color, 0.1)
    })
  }
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

onMounted(async () => {
  if (isPlaylist.value && browserTypeId.value !== undefined && browserTypeId.value !== '') {
    playlistSelected.value = Number(browserTypeId.value)
  }
  if (isSoundscape.value) {
    soundscapeResponse.value = await apiGetSoundscapes(apiClientArbimon, selectedProjectSlug.value ?? '')

    if (browserTypeId.value !== undefined) {
      soundscapeSelected.value = soundscapeResponse.value?.find(it => it.id === Number(browserTypeId.value)) ?? undefined
    }
  }
  if (isSite.value && browserTypeId.value !== undefined && browserTypeId.value !== '') {
    idRecording.value = Number(browserTypeId.value)
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
  page.value = 0
  emits('emitSelectedPlaylist', val)
  recordingResponse.value = await apiArbimonPostPlaylistItems(apiClientArbimon, selectedProjectSlug.value ?? '', val, { offset: (page.value * pageSize), limit: pageSize })
})

watch(() => auduoEventDetections.value, () => {
  fetchAudioEvents()
})

watch(() => isSoundscape.value, () => {
  if (isSoundscape.value === true) {
    activeLayer.value = undefined
    emits('emitActiveLayer', activeLayer.value)
  }
})

watch(() => clustering.value, () => {
  fetchClustering()
})

watch(() => yearly.value, () => {
  refetchAvailableBySiteYear()
})

watch(() => props.isSidebarTagsUpdated, async () => {
  refetchRecordingTags()
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
