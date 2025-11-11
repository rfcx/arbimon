<template>
  <div
    ref="spectrogramContainer"
    class="ml-120 relative"
  >
    <div
      class="flex flex-row flex-nowrap relative h-screen"
    >
      <div
        v-if="visobject && visobject.isDisabled"
        class="justify-center items-center pl-2 text-xl"
      >
        <span>Unavailable</span>
      </div>
      <div v-if="visobject && visobject.tiles.set && spectrogramContainer">
        <div
          v-for="(tile, index) in visobject.tiles.set"
          :key="index"
          style="position:absolute;"
          :class="{'crisp-image': tile.crisp}"
          :style="{
            left: Math.floor(tile.s * getSec2px(spectrogramMetrics.width, visobject.domain.x.span)) + legendMetrics.axis_sizew + 'px',
            bottom: (visobject.scale.originalScale ? Math.floor(spectrogramMetrics.height - tile.hz * getHz2px(spectrogramMetrics.height, visobject.domain.y.span)) : 0) + legendMetrics.axis_sizeh + 'px',
            height: Math.ceil(tile.dhz * getHz2px(spectrogramMetrics.height, visobject.domain.y.span)) + 'px',
            width: Math.ceil(tile.ds * getSec2px(spectrogramMetrics.width, visobject.domain.x.span)) + 'px'
          }"
        >
          <VisualizerTileImg
            :id="'spectrogramTile'+index"
            :tile-src="tile.src"
          />
        </div>
      </div>
      <!-- y legend -->
      <svg
        v-show="visobject && visobject.domain.y"
        ref="axisY"
        class="z-5 absolute"
      >.</svg>
      <div
        v-if="visobject && visobject.domain.y"
        class="whitespace-nowrap absolute z-5"
        :style="{
          left: - Math.ceil(legendMetrics.axis_margin_x * 3) + 'px',
          top: Math.ceil(containerHeight / 2) + 'px'
        }"
      >
        <span class="inline-block transform -rotate-90">
          {{ visobject.domain.y.unit || 'Frequency ( kHz )' }}
        </span>
      </div>
      <!-- x legend -->
      <svg
        v-show="visobject && visobject.domain.x"
        ref="axisX"
        class="z-5 absolute"
      >.</svg>
      <div
        v-if="visobject && visobject.domain.x"
        class="whitespace-nowrap absolute z-5"
        :style="{
          left: Math.ceil((containerWidth - legendMetrics.axis_margin_x) / 2) + 'px',
          top: Math.ceil(containerHeight - legendMetrics.axis_margin_x * 2) + 'px'
        }"
      >
        <div>{{ visobject.domain.x.unit || 'Time ( s )' }}</div>
      </div>
      <!-- play position -->
      <div
        v-if="visobject && visobject.type == 'rec'"
        class="absolute pointer-events-none z-5 bottom-60px border-1 border-blue-700 w-1px"
        :style="{
          left: getLeftPositionPlay(),
          height: getHeightPlay()
        }"
      />
      <!-- max frequency -->
      <div
        v-if="freqFilter"
        class="filter-band top-[15px] z-5"
        :style="{ height: `${hz2y(freqFilter?.filterMax, 1)}px`, width: `${spectrogramMetrics.width}px`, left: legendMetrics.axis_sizew + 'px'}"
      />
      <div
        v-if="freqFilter"
        class="filter-band z-5"
        :style="{ top: `${hz2y(freqFilter?.filterMin, 1) + 15}px`, height: `${dhz2height(freqFilter?.filterMin, 0)}px`, width: `${spectrogramMetrics.width}px`, left: legendMetrics.axis_sizew + 'px' }"
      />
      <!-- ROI box -->
      <div
        v-if="activeLayer && activeLayer !== 'New Training Set'"
        class="input-source cursor-crosshair relative"
        :style="{ height: spectrogramMetrics.height + 'px', width: spectrogramMetrics.width + 'px', left: legendMetrics.axis_sizew + 'px', top: legendMetrics.axis_margin_top + 'px'}"
        @mousedown.left="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      >
        <!-- Affixed Message -->
        <div class="pl-5 absolute text-pitch font-medium top-6">
          Click to add {{ activeLayer }} to this recording.
          <div
            v-if="bboxWrapper.bbox && bboxWrapper.bbox.x1 !== 0"
            class="mt-1 text-sm text-pitch"
          >
            Press <kbd>esc</kbd> to cancel {{ activeLayer }} addition.
          </div>
        </div>

        <!-- Bbox editor-->
        <div
          v-if="bboxWrapper.bbox"
          class="absolute border-1 border-[rgba(0,0,255)] bg-[rgba(0,0,255,0.05)]"
          :style="{ left: sec2x(bboxWrapper.bbox.x1, 1) + 'px', top: hz2y(bboxWrapper.bbox.y2, 1) + 'px', width: getDsec2width(bboxWrapper.bbox.x2, bboxWrapper.bbox.x1, 1), height: getDhz2height(bboxWrapper.bbox.y2, bboxWrapper.bbox.y1)}"
        >
          <icon-custom-fi-circle-dot class="w-3 h-3 absolute control-point -top-6px -left-6px cp-resize-tl" />
          <icon-custom-fi-circle-dot class="w-3 h-3 absolute control-point -top-6px -right-6px cp-resize-tr" />
          <icon-custom-fi-circle-dot class="w-3 h-3 absolute control-point -bottom-6px -left-6px cp-resize-bl" />
          <icon-custom-fi-circle-dot class="w-3 h-3 absolute control-point -bottom-6px -right-6px cp-resize-br" />
        </div>
        <VisualizerTagBboxModal
          v-if="activeLayer === 'tag'"
          v-model="tagKeyword"
          :keyword="tagKeyword"
          :visible="bboxValid"
          :items="tagKeyword.length && tagKeyword.length > 3 ? searchedTags?.map((tag) => { return {id: tag.tag_id, label: tag.tag }}) : projectTags?.map((tag) => { return {id: tag.tag_id, label: tag.tag }})"
          :title="'Create Tag'"
          :list-name="'Tag'"
          @emit-selected-item="handleNewTag"
          @cancel="bboxValid = false"
        />
        <VisualizerTrainingSetBboxModal
          v-if="activeLayer === 'Training Set ROI Box' && trainingSet"
          :title="'Training Set'"
          :training-set-name="trainingSet.name"
          :visible="bboxValid"
          @handle-action="handleNewTrainingSet"
        />
      </div>
      <!-- Tags layer -->
      <div v-if="spectrogramTags && layerVisibility.tag === true">
        <div
          v-for="(tag, index) in spectrogramTags"
          :key="index"
          class="border-1 border-[#ff5340] bg-[rgba(255,83,64,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'roi-selected': toggledTag === tag.bbox.id }"
          :style="{
            left: sec2x(tag.bbox.t0 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(tag.bbox.f1 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(tag.bbox.t1 ?? 0, tag.bbox.t0 ?? 0, 1),
            height: getDhz2height(tag.bbox.f1 ?? 0, tag.bbox.f0 ?? 0)
          }"
          tabindex="-1"
          :title="'Tag: ' + getTagNames(tag.tags)"
          data-tooltip-style="dark"
          :data-tooltip-target="`tagTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleTag(tag.bbox.id)"
        />
        <!-- Tags Tooltips -->
        <div
          v-for="(tag, index) in spectrogramTags"
          :id="`tagTooltipId-${index}`"
          :key="`tagTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          {{ 'Tag: ' + getTagNames(tag.tags) }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Species layer -->
      <div v-if="spectrogramPM && layerVisibility.species === true">
        <div
          v-for="(pmRoi, index) in spectrogramPM"
          :key="index"
          class="border-1 border-[#268f4b] bg-[rgba(38,143,75,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'roi-selected': toggledPmRoiBox === pmRoi.patternMatchingRoiId }"
          :style="{
            left: sec2x(pmRoi.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(pmRoi.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(pmRoi.x2 ?? 0, pmRoi.x1 ?? 0, 1),
            height: getDhz2height(pmRoi.y2 ?? 0, pmRoi.y1 ?? 0)
          }"
          tabindex="-1"
          :title="'Patter Matching Roi Box: ' + pmRoi.name"
          data-tooltip-style="dark"
          :data-tooltip-target="`pmTooltipId-${index}`"
          @click="$event.stopPropagation(); togglePmRoiBox(pmRoi.patternMatchingRoiId)"
        />
        <!-- PM Roi Tooltips -->
        <div
          v-for="(pmRoi, index) in spectrogramPM"
          :id="`pmTooltipId-${index}`"
          :key="`pmTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          {{ 'Patter Matching Roi Box: ' + pmRoi.name }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Training Sets layer -->
      <div v-if="spectrogramTrainingSets && layerVisibility.ts === true">
        <div
          v-for="(ts, index) in spectrogramTrainingSets"
          :key="index"
          class="border-1 border-[#5340ff] bg-[rgba(83,64,255,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'roi-selected': toggledTrainingSet === ts.bbox.id }"
          :style="{
            left: sec2x(ts.bbox.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(ts.bbox.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(ts.bbox.x2 ?? 0, ts.bbox.x1 ?? 0, 1),
            height: getDhz2height(ts.bbox.y2 ?? 0, ts.bbox.y1 ?? 0)
          }"
          tabindex="-1"
          :title="'Training Set: ' + getTrainingSetsNames(ts.ts)"
          data-tooltip-style="dark"
          :data-tooltip-target="`tsTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleTrainingSet(ts.bbox.id)"
        />
        <!-- Training Sets Tooltips -->
        <div
          v-for="(ts, index) in spectrogramTrainingSets"
          :id="`tsTooltipId-${index}`"
          :key="`tsTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          {{ 'Training Set: ' + getTrainingSetsNames(ts.ts) }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import type { AxiosInstance } from 'axios'
import * as d3 from 'd3'
import { initTooltips } from 'flowbite'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { RecordingTagResponse, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import { type RecordingTrainingSet, type RecordingTrainingSetParams, type TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { type AlertDialogType } from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetTags } from '../../_composables/use-recordings'
import { useGetRecordingTrainingSets, usePostTrainingSet } from '../../_composables/use-training-sets'
import { useGetPatternMatchingBoxes, useGetRecordingTag, usePutRecordingTag, useSearchTag } from '../../_composables/use-visualizer'
import { type BboxGroupPm, type BboxGroupTags, type BboxGroupTrainingSets, type BboxListItem, type FreqFilter } from '../types'
import { type LayerVisibility } from '../visualizer-page.vue'
import { CreateBBoxEditor } from './visualizer-create-bbox-editor'
import { doXAxisLayout, doYAxisLayout, makeScale } from './visualizer-scale'
import VisualizerTagBboxModal from './visualizer-tag-bbox-modal.vue'
import VisualizerTileImg from './visualizer-tile-img.vue'
import VisualizerTrainingSetBboxModal from './visualizer-trainin-set-bbox-modal.vue'

const props = defineProps<{
  visobject: Visobject | undefined
  currentTime: number
  freqFilter?: FreqFilter
  isSpectrogramTagsUpdated: boolean
  activeLayer?: string | undefined
  trainingSet: TrainingSet | undefined
  layerVisibility: LayerVisibility
}>()

const selectedProjectSlug = computed(() => store.project?.slug)
const spectrogramContainer = ref<HTMLElement | null>(null)
const containerSize = reactive({ width: 0, height: 0 })
const spectrogramTileHeight = ref<number>(0)
const axisY = ref<SVGSVGElement | null>(null)
const axisX = ref<SVGSVGElement | null>(null)
const bboxValid = ref(false)
const pointer = reactive<{ x: number; y: number; sec: number; hz: number }>({
  x: 0,
  y: 0,
  sec: 0,
  hz: 0
})

const bboxWrapper = ref(new CreateBBoxEditor())
const tagKeyword = ref<string>('')
const spectrogramTags = ref<BboxGroupTags[]>([])
const spectrogramTrainingSets = ref<BboxGroupTrainingSets[]>([])
const spectrogramPM = ref<BboxGroupPm[]>([])
const toggledTag = ref<number>()
const toggledTrainingSet = ref<number>()
const toggledPmRoiBox = ref<number>()

const success = ref<AlertDialogType>('error')
const title = ref('')
const message = ref('')
const showAlert = ref(false)
const showAlertDialog = (type: AlertDialogType, titleValue: string, messageValue: string, hideAfter = 7000) => {
  showAlert.value = true
  success.value = type
  title.value = titleValue
  message.value = messageValue
  setTimeout(() => {
    showAlert.value = false
  }, hideAfter)
}

const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const store = useStore()
const route = useRoute()
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)

const { height: containerHeight, width: containerWidth } = useElementSize(spectrogramContainer)

const { data: projectTags, refetch: refetchProjectTags } = useGetTags(apiClientArbimon, selectedProjectSlug)
const { data: recordingTags, refetch: refetchRecordingTags } = useGetRecordingTag(apiClientArbimon, selectedProjectSlug, browserTypeId)
const { data: searchedTags, refetch: refetchSearchTags } = useSearchTag(apiClientArbimon, selectedProjectSlug, { q: tagKeyword.value })
const { data: pmBoxes, refetch: refetchPatternMatchingBoxes } = useGetPatternMatchingBoxes(apiClientArbimon, selectedProjectSlug, { rec_id: browserTypeId.value as string, validated: 1 })
const { mutate: mutateAddRecordingTag } = usePutRecordingTag(apiClientArbimon, selectedProjectSlug, browserTypeId)
const { mutate: mutatePostTrainingSet } = usePostTrainingSet(apiClientArbimon, selectedProjectSlug)

const recordingTrainingSetParams = computed<RecordingTrainingSetParams>(() => {
  return {
    recordingId: browserTypeId.value,
    trainingSetId: props.trainingSet ? props.trainingSet.id : ''
  }
})
const { data: trainingSets, refetch: refetchRecordingTrainingSets } = useGetRecordingTrainingSets(apiClientArbimon, selectedProjectSlug, recordingTrainingSetParams)

const legendMetrics = computed(() => {
  return {
    gutter: spectrogramContainer.value?.scrollHeight,
    axis_sizew: 60,
    axis_sizeh: 60,
    axis_lead: 15,
    axis_margin_x: 20,
    axis_margin_top: 15,
    scale: {}
  }
})

const round = (val: number, precision = 1) => {
  precision = precision || 1
  return (((val / precision) | 0) * precision) || 0
}

const spectrogramMetrics = computed(() => {
  const width = containerSize.width
  const height = containerSize.height
  return {
    legend: { ...legendMetrics.value },
    css: {
      top: legendMetrics.value.axis_lead,
      left: legendMetrics.value.axis_sizew,
      width,
      height
    },
    width,
    height
  }
})

const drawChart = () => {
  if (!axisY.value || !axisX.value || props.visobject === undefined) return
  axisY.value.innerHTML = ''
  d3.select(axisY.value).selectAll('*').remove()
  axisX.value.innerHTML = ''
  d3.select(axisX.value).selectAll('*').remove()
  const scale = {
    x: makeScale(props.visobject.domain.x, [0, spectrogramMetrics.value.width]),
    y: makeScale(props.visobject.domain.y, [spectrogramMetrics.value.height, 0]),
    sec2px: 100 / 1.0
  }
  const updatedVisobject = {
    ...props.visobject,
    spectrogram: spectrogramMetrics.value
  }
  updatedVisobject.spectrogram.legend.scale = scale
  doYAxisLayout(axisY, updatedVisobject)
  doXAxisLayout(axisX, updatedVisobject)
}

const getSec2px = (containerWidth: number, xSpan: number): number => {
  spectrogramTileHeight.value = document.getElementById('spectrogramTile0')?.clientHeight ?? 0
  return containerWidth / xSpan
}

const getHz2px = (containerHeight: number, ySpan: number): number => {
  return containerHeight / ySpan
}

const hz2y = (hertz: number, round: number, intervalAlign?: number): number => {
  if (!props.visobject) return 0
  hertz = alignToInterval(hertz - props.visobject.offset.hz, props.visobject.domain.y, intervalAlign)
  const h = spectrogramMetrics.value.height ?? 0
  const y = h - hertz * getHz2px(spectrogramMetrics.value.height, props.visobject.domain.y.span)
  return round ? (y ?? 0) : +y
}

const sec2x = (seconds: number, round: number, intervalAlign?: number) => {
  if (!props.visobject) return 0
  seconds = alignToInterval(seconds - props.visobject.offset.sec, props.visobject.domain.x, intervalAlign)
  const x = seconds * getSec2px(spectrogramMetrics.value.width, props.visobject.domain.x.span)
  return round ? (x ?? 0) : +x
}

const dhz2height = (hz1: number, hz2: number, round?: number, inclusive?: boolean): number => {
  if (!props.visobject) return 0
  if (inclusive !== undefined) {
    hz1 = alignToInterval(hz1, props.visobject.domain.y, 1)
  }
  const h = (hz1 - hz2) * getHz2px(spectrogramMetrics.value.height, props.visobject.domain.y.span)
  return round !== undefined ? (h ?? 0) : +h
}

const alignToInterval = (unit: number, domain: any, align: number | undefined): number => {
  if (align === undefined || domain === undefined || (domain !== undefined && domain.unit_interval === undefined)) {
    return unit
  } else {
    const f = domain?.from ?? 0
    const u = domain.unit_interval
    unit = Math.floor((unit - f) / u) * u + f
    return unit + align * u
  }
}

const dsec2width = (seconds1: number, seconds2: number, round?: number | undefined, inclusive?: boolean) => {
  if (!props.visobject) return 0
  if (inclusive !== undefined) {
    seconds1 = alignToInterval(seconds1, props.visobject.domain.x, 1)
  }
  const w = (seconds1 - seconds2) * getSec2px(spectrogramMetrics.value.width, props.visobject.domain.x.span)
  return round !== undefined ? (w ?? 0) : +w
}

const x2sec = (x: number, intervalAlign?: number | undefined) => {
  if (!props.visobject) return 0
  let seconds = x / getSec2px(spectrogramMetrics.value.width, props.visobject.domain.x.span)
  seconds += props.visobject.offset.sec
  return alignToInterval(+seconds, props.visobject.domain.x, intervalAlign)
}

const y2hz = (y: number, intervalAlign?: number | undefined) => {
  if (!props.visobject) return 0
  const h = spectrogramMetrics.value.height
  let hertz = (h - y) / getHz2px(spectrogramMetrics.value.height, props.visobject.domain.y.span)
  hertz += props.visobject.offset.hz
  return alignToInterval(+hertz, props.visobject.domain.y, intervalAlign)
}

const getDsec2width = (t1: number, t0: number, round?: number | undefined): string => {
  return `${dsec2width(t1, t0, round)}px`
}

const getDhz2height = (f1: number, f0: number): string => {
  return `${dhz2height(f1, f0)}px`
}

const getLeftPositionPlay = (): string => {
  if (!props.visobject) return ''
  return `${round(props.currentTime * getSec2px(spectrogramMetrics.value.width, props.visobject.domain.x.span) + legendMetrics.value.axis_sizew)}px`
}

const getHeightPlay = (): string => {
  return `${Math.ceil(spectrogramTileHeight.value)}px`
}

const getTagNames = (tags: RecordingTagResponse[]): string => {
  return tags.map(t => t.tag).join(',')
}

const getTrainingSetsNames = (trainingSets: RecordingTrainingSet[]): string => {
  return trainingSets.map(t => t.name).join(',')
}

const handleResize = (): void => {
  containerSize.width = spectrogramContainer.value ? (spectrogramContainer.value.clientWidth - legendMetrics.value.axis_sizew - legendMetrics.value.axis_margin_x) : containerWidth.value - legendMetrics.value.axis_sizew - legendMetrics.value.axis_margin_x
  containerSize.height = spectrogramContainer.value ? (spectrogramContainer.value.clientHeight - legendMetrics.value.axis_sizeh - legendMetrics.value.axis_lead) : containerHeight.value - legendMetrics.value.axis_sizeh - legendMetrics.value.axis_lead
  drawChart()
}

const onMouseDown = (e: MouseEvent) => {
  pointer.sec = x2sec(e.offsetX)
  pointer.hz = y2hz(e.offsetY)
  bboxWrapper.value.add_point(pointer.sec, pointer.hz)
}

const onMouseMove = (e: MouseEvent) => {
  if (e.buttons === 1 && e.offsetX > pointer.sec) {
    pointer.sec = x2sec(e.offsetX)
    pointer.hz = y2hz(e.offsetY)
    bboxWrapper.value.add_tracer_point(pointer.sec, pointer.hz)
  }
}

const onMouseUp = () => {
  bboxWrapper.value.add_point(pointer.sec, pointer.hz)
  bboxValid.value = true
}

const onKeyUp = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    resetBBox()
    toggledTag.value = undefined
  }
}

const resetBBox = (): void => {
  bboxWrapper.value.reset()
  bboxValid.value = false
}

const handleNewTag = (tag: BboxListItem): void => {
  bboxValid.value = false
  mutateAddRecordingTag({
    id: tag.id,
    f0: bboxWrapper.value?.bbox?.y1,
    f1: bboxWrapper.value?.bbox?.y2,
    t0: bboxWrapper.value?.bbox?.x1,
    t1: bboxWrapper.value?.bbox?.x2
   }, {
    onSuccess: async () => {
      refetchProjectTags()
      refetchRecordingTags()
      showAlertDialog('success', 'Success', 'Tag added')
      resetBBox()
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error adding tag')
      resetBBox()
    }
  })
}

const handleNewTrainingSet = (action: string): void => {
  bboxValid.value = false
  if (action === 'cancel') {
    return resetBBox()
  }
  mutatePostTrainingSet({
    trainingSetId: props.trainingSet?.id as number,
    recording: +browserTypeId.value,
    roi: {
      x1: bboxWrapper.value?.bbox?.x1 as number,
      x2: bboxWrapper.value?.bbox?.x2 as number,
      y1: bboxWrapper.value?.bbox?.y1 as number,
      y2: bboxWrapper.value?.bbox?.y2 as number
    }
   }, {
    onSuccess: () => {
      refetchRecordingTrainingSets()
      showAlertDialog('success', 'Success', 'Training set ROI is added')
      resetBBox()
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error creating ROI training set')
      resetBBox()
    }
  })
}

const searchTags = (text: string) => {
  if (!text) return
  refetchSearchTags()
}

const toggleTag = (id: number) => {
  if (toggledTag.value === id) toggledTag.value = undefined
  else toggledTag.value = id
}

const toggleTrainingSet = (id: number) => {
  if (toggledTrainingSet.value === id) toggledTrainingSet.value = undefined
  else toggledTrainingSet.value = id
}

const togglePmRoiBox = (id: number) => {
  if (toggledPmRoiBox.value === id) toggledPmRoiBox.value = undefined
  else toggledPmRoiBox.value = id
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

const groupByBboxForTrainingSets = (ts: RecordingTrainingSet[]): BboxGroupTrainingSets[] => {
  const map: Record<string, BboxGroupTrainingSets> = {}
  for (const t of ts) {
    if (t.x1 != null && t.x2 != null) {
      const key = [t.x1, t.y1, t.x2, t.y2].join(',')
      if (map[key] === undefined) map[key] = { bbox: t, ts: [] }
      map[key].ts.push(t)
    }
  }
  return Object.values(map)
}

const fetchSpeciesPresence = (): void => {
  const rec = props.visobject && (props.visobject.type === 'recording') && props.visobject.id
  if (rec !== undefined && pmBoxes.value !== undefined) {
    spectrogramPM.value = pmBoxes.value.map(roi => {
      return {
        recId: roi.recording_id,
        patternMatchingId: roi.pattern_matching_id,
        patternMatchingRoiId: roi.pattern_matching_roi_id,
        name: roi.species_name + ' ' + roi.songtype_name,
        species: roi.species_name,
        songtype: roi.songtype_name,
        x1: roi.x1,
        x2: roi.x2,
        y1: roi.y1,
        y2: roi.y2,
        display: roi.recording_id === rec ? 'block' : 'none',
        isPopupOpened: false
      }
    })
    // Add validated aed species boxes
    if (props.visobject && props.visobject.aedValidations.length) {
      spectrogramPM.value = spectrogramPM.value.concat(props.visobject.aedValidations)
    }
  }
}

watch(() => axisY.value, () => {
  drawChart()
  if (trainingSets.value) {
    spectrogramTrainingSets.value = groupByBboxForTrainingSets(trainingSets.value)
  }
  refetchPatternMatchingBoxes()
  fetchSpeciesPresence()
})

watch(() => tagKeyword.value, () => {
  if (tagKeyword.value.length && tagKeyword.value.length > 2) {
    searchTags(tagKeyword.value)
    refetchSearchTags()
  }
})

watch(() => recordingTags.value, async (newValue) => {
  if (!newValue) return
  spectrogramTags.value = groupByBbox(newValue)
  await nextTick()
  initTooltips()
})

watch(() => props.isSpectrogramTagsUpdated, async () => {
  refetchRecordingTags()
  await nextTick()
  initTooltips()
})

watch(() => pmBoxes.value, async (newValue) => {
  if (!newValue) return
  fetchSpeciesPresence()
  await nextTick()
  initTooltips()
})

watch(() => trainingSets.value, async () => {
  if (trainingSets.value) {
    spectrogramTrainingSets.value = groupByBboxForTrainingSets(trainingSets.value)
  }
  await nextTick()
  initTooltips()
})

watch(() => props.trainingSet, async () => {
  await refetchRecordingTrainingSets()
  if (trainingSets.value) {
    spectrogramTrainingSets.value = groupByBboxForTrainingSets(trainingSets.value)
  }
  await nextTick()
  initTooltips()
})

onMounted(() => {
  containerSize.width = spectrogramContainer.value ? (spectrogramContainer.value.clientWidth - legendMetrics.value.axis_sizew - legendMetrics.value.axis_margin_x) : containerWidth.value - legendMetrics.value.axis_sizew - legendMetrics.value.axis_margin_x
  containerSize.height = spectrogramContainer.value ? (spectrogramContainer.value.clientHeight - legendMetrics.value.axis_sizeh - legendMetrics.value.axis_lead) : containerHeight.value - legendMetrics.value.axis_sizeh - legendMetrics.value.axis_lead
  window.addEventListener('resize', handleResize)
  document.addEventListener('keyup', onKeyUp)
  if (!recordingTags.value) return
  spectrogramTags.value = groupByBbox(recordingTags.value)
  initTooltips()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keyup', onKeyUp)
})

</script>

<style lang="scss">
.filter-band {
  position: absolute;
  background-color: rgba(255,255,255,.7)
}
.roi-selected {
  background-color: rgba(255,83,64,0.2) !important;
}
.crisp-image {
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: optimizeSpeed;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
}
.input-source {
  position: absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  pointer-events: auto;
  z-index:1000;
}
.cursor-crosshair {
  cursor: crosshair;
}
.control-point{
  position:absolute;
  font-size:14px;
  &.cp-resize-tl, &.cp-resize-br{
      cursor:nwse-resize;
  }
  &.cp-resize-tr, &.cp-resize-bl{
      cursor:nesw-resize;
  }
}
</style>
