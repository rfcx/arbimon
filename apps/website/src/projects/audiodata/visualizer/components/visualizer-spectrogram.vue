<template>
  <div
    ref="spectrogramContainer"
    class="ml-120 relative"
  >
    <div
      class="flex flex-row flex-nowrap relative h-screen"
    >
      <div
        v-if="!visobject && !visobjectSoundscape"
        class="absolute inset-0 flex justify-center items-center text-sm font-medium"
      >
        <span>Please select a  {{ isSoundscape ? 'soundscape' : 'recording' }}</span>
      </div>
      <div
        v-if="visobject && visobject.isDisabled"
        class="justify-center items-center pl-2 text-sm font-medium"
      >
        <span>Unavailable</span>
      </div>
      <!-- Base image - recording, playlist -->
      <div
        v-if="visobject && visobject.tiles.set && spectrogramContainer"
      >
        <div
          v-for="(tile, index) in visobject.tiles.set"
          :key="index"
          class="absolute"
          :style="{
            left: Math.floor(tile.s * getSec2px(spectrogramMetrics.width, visobject.domain.x.span)) + legendMetrics.axis_sizew + 'px',
            top: (visobject.scale.originalScale ? Math.floor(spectrogramMetrics.height - tile.hz * getHz2px(spectrogramMetrics.height, visobject.domain.y.span)) : 0) + legendMetrics.axis_margin_top + 'px',
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
      <!-- Base image - soundscape -->
      <div v-if="visobjectSoundscape && spectrogramContainer">
        <div
          v-for="(tile, index) in visobjectSoundscape.tiles.set"
          :key="index"
          class="absolute"
          :style="{
            left: Math.floor(tile.s * getSec2px(spectrogramMetrics.width, visobjectSoundscape.domain.x.span)) + legendMetrics.axis_sizew + 'px',
            top: (visobjectSoundscape.scale.originalScale ? Math.floor(spectrogramMetrics.height - tile.hz * getHz2px(spectrogramMetrics.height, visobjectSoundscape.domain.y.span)) : 0) + legendMetrics.axis_margin_top + 'px',
            height: Math.ceil(tile.dhz * getHz2px(spectrogramMetrics.height, visobjectSoundscape.domain.y.span)) + 'px',
            width: Math.ceil(tile.ds * getSec2px(spectrogramMetrics.width, visobjectSoundscape.domain.x.span)) + 'px'
          }"
        >
          <VisualizerTileImg
            :id="'spectrogramTile'+index"
            :tile-src="tile.src + '?r=' + (new Date()).getTime()"
          />
        </div>
      </div>

      <!-- zoom -->
      <div
        v-if="visobject"
        class="zoom-control-group fixed z-6"
        :style="{
          top: (legendMetrics.axis_margin_top + 10) + 'px',
          left: (containerSize.width + 300) + 'px'
        }"
      >
        <ZoomControl
          v-model="zoomData.x"
          :horizontal="true"
        />
        <ZoomControl
          v-model="zoomData.y"
          :horizontal="false"
        />
      </div>

      <!-- Y scale -->
      <svg
        ref="axisY"
        class="z-5 absolute"
      >.</svg>
      <!-- Y legend - recording, playlist-->
      <div
        v-if="visobject && visobject.domain.y && !isSoundscape"
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
      <!-- Y legend - soundscape -->
      <div
        v-if="visobjectSoundscape && visobjectSoundscape.domain.y && isSoundscape"
        class="whitespace-nowrap absolute z-5"
        :style="{
          left: - Math.ceil(legendMetrics.axis_margin_x * 3) + 'px',
          top: Math.ceil(containerHeight / 2) + 'px'
        }"
      >
        <span class="inline-block transform -rotate-90">
          {{ visobjectSoundscape.domain.y.unit || 'Frequency ( kHz )' }}
        </span>
      </div>

      <!-- X scale -->
      <svg
        ref="axisX"
        class="z-5 absolute"
      >.</svg>
      <!-- X legend - recording, playlist-->
      <div
        v-if="visobject && visobject.domain.x && !isSoundscape"
        class="whitespace-nowrap absolute z-5"
        :style="{
          left: Math.ceil((containerWidth - legendMetrics.axis_margin_x) / 2) + 'px',
          top: Math.ceil(spectrogramMetrics.height + legendMetrics.axis_margin_x * 2) + 'px'
        }"
      >
        <div>{{ visobject.domain.x.unit || 'Time ( s )' }}</div>
      </div>
      <!-- X legend - soundscape -->
      <div
        v-if="visobjectSoundscape && visobjectSoundscape.domain.x && isSoundscape"
        class="whitespace-nowrap absolute z-5"
        :style="{
          left: Math.ceil((containerWidth - legendMetrics.axis_margin_x) / 2) + 'px',
          top: Math.ceil(spectrogramMetrics.height + legendMetrics.axis_margin_x * 2) + 'px'
        }"
      >
        <div>{{ visobjectSoundscape.domain.x.unit || 'Time ( s )' }}</div>
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
      <!-- Crosshair container -->
      <div
        class="absolute z-5"
        :style="{ height: spectrogramMetrics.height + 'px', width: spectrogramMetrics.width + 'px', left: legendMetrics.axis_sizew + 'px', top: legendMetrics.axis_margin_top + 'px'}"
        @mousemove="setPointerData"
        @mouseleave="resetPointerData"
      />
      <div
        v-if="activeLayer && activeLayer !== 'New Training Set' && activeLayer !== 'aed'"
        ref="crosshairContainerRef"
        class="cursor-crosshair absolute z-5"
        :style="{ height: spectrogramMetrics.height + 'px', width: spectrogramMetrics.width + 'px', left: legendMetrics.axis_sizew + 'px', top: legendMetrics.axis_margin_top + 'px'}"
        @mousedown.left="onMouseDownRoi"
        @mousemove.prevent="onMouseMoveRoi"
        @mouseup="onMouseUpRoi"
      >
        <!-- Affixed Message -->
        <div class="pl-5 absolute text-pitch font-medium top-6 select-none">
          Click to add {{ activeLayer }} to this recording.
          <div
            v-if="createBboxEditor.bbox && createBboxEditor.bbox.x1 !== 0"
            class="mt-1 text-sm text-pitch select-none"
          >
            Press <kbd>esc</kbd> to cancel {{ activeLayer }} addition.
          </div>
        </div>

        <!-- Bbox editor-->
        <div
          v-if="createBboxEditor.bbox"
          class="absolute border-1 border-[rgba(0,0,255)] bg-[rgba(0,0,255,0.05)]"
          :class="{
            'border-[#ff5340] bg-[rgba(255,83,64,0.05)]': activeLayer === 'tag',
            'border-[#5340ff] bg-[rgba(83,64,255,0.05)]': activeLayer === 'Training Set ROI Box',
            'border-[#ffa600] bg-[rgba(255,174,0,0.05)]': activeLayer === 'template'
          }"
          :style="{
            left: sec2x(createBboxEditor.bbox.x1, 1) + 'px',
            top: hz2y(createBboxEditor.bbox.y2, 1) + 'px',
            width: getDsec2width(createBboxEditor.bbox.x2, createBboxEditor.bbox.x1, 1),
            height: getDhz2height(createBboxEditor.bbox.y2, createBboxEditor.bbox.y1)
          }"
        >
          <icon-custom-fi-circle class="w-3 h-3 text-rgba(0,0,255) absolute control-point -top-6px -left-6px cp-resize-tl" />
          <icon-custom-fi-circle class="w-3 h-3 text-rgba(0,0,255) absolute control-point -top-6px -right-6px cp-resize-tr" />
          <icon-custom-fi-circle class="w-3 h-3 text-rgba(0,0,255) absolute control-point -bottom-6px -left-6px cp-resize-bl" />
          <icon-custom-fi-circle class="w-3 h-3 text-rgba(0,0,255) absolute control-point -bottom-6px -right-6px cp-resize-br" />
        </div>
      </div>
      <VisualizerTagBboxModal
        v-if="activeLayer === 'tag'"
        :visible="bboxValid"
        :title="'Create Tag'"
        :list-name="'Tag'"
        @emit-selected-item="handleNewTag"
        @cancel="resetBBox()"
      />
      <VisualizerTemplateModal
        v-if="activeLayer === 'template'"
        :visible="bboxValid"
        @emit-template-data="handleNewTemplate"
        @cancel="resetBBox()"
      />
      <VisualizerTrainingSetBboxModal
        v-if="activeLayer === 'Training Set ROI Box' && trainingSet"
        :title="'Training Set'"
        :training-set-name="trainingSet.name"
        :visible="bboxValid"
        @handle-action="handleNewTrainingSet"
      />
      <!-- Query box layer -->
      <div v-if="browserQuery !== undefined">
        <div
          class="border-1 border-[#ffa600] bg-[rgba(255,166,0,0.05)] z-5 cursor-pointer absolute"
          :style="{
            left: sec2x(bboxQuery.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(bboxQuery.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(bboxQuery.x2 ?? 0, bboxQuery.x1 ?? 0, 1),
            height: getDhz2height(bboxQuery.y2 ?? 0, bboxQuery.y1 ?? 0)
          }"
        />
      </div>
      <!-- Tags layer -->
      <div v-if="spectrogramTags && layerVisibility.tag === true">
        <div
          v-for="(tag, index) in spectrogramTags"
          :key="index"
          class="border-1 border-[#ff5340] bg-[rgba(255,83,64,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'bg-[rgba(255,83,64,0.2)]': toggledTag === tag.bbox.id }"
          :style="{
            left: sec2x(tag.bbox.t0 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(tag.bbox.f1 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(tag.bbox.t1 ?? 0, tag.bbox.t0 ?? 0, 1),
            height: getDhz2height(tag.bbox.f1 ?? 0, tag.bbox.f0 ?? 0)
          }"
          tabindex="-1"
          data-tooltip-style="dark"
          :data-tooltip-target="`tagTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleTag(tag.bbox.id);"
        />
        <!-- Tags Tooltips -->
        <div
          v-for="(tag, index) in spectrogramTags"
          :id="`tagTooltipId-${index}`"
          :key="`tagTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          <div>
            Tag: <span class="font-semibold">{{ getTagNames(tag.tags) }}</span>
          </div>
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Species layer -->
      <div v-show="spectrogramPM && layerVisibility.species === true">
        <div
          v-for="(pmRoi, index) in spectrogramPM"
          :key="index"
          class="border-1 border-[#268f4b] bg-[rgba(38,143,75,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'bg-[rgba(38,143,75,0.2)]': toggledPmRoiBox === pmRoi.patternMatchingRoiId }"
          :style="{
            left: sec2x(pmRoi.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(pmRoi.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(pmRoi.x2 ?? 0, pmRoi.x1 ?? 0, 1),
            height: getDhz2height(pmRoi.y2 ?? 0, pmRoi.y1 ?? 0)
          }"
          tabindex="-1"
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
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          <div>Validation</div>
          <div class="mt-3">
            Species: <span class="font-semibold">{{ pmRoi.species }}</span>
          </div>
          <div>Sound: <span class="font-semibold">{{ pmRoi.songtype }}</span></div>
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Training Sets layer -->
      <div v-show="spectrogramTrainingSets && layerVisibility.ts === true">
        <div
          v-for="(ts, index) in spectrogramTrainingSets"
          :key="index"
          class="border-1 border-[#5340ff] bg-[rgba(83,64,255,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'bg-[rgba(83,64,255,0.2)]': toggledTrainingSet === ts.bbox.id }"
          :style="{
            left: sec2x(ts.bbox.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(ts.bbox.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(ts.bbox.x2 ?? 0, ts.bbox.x1 ?? 0, 1),
            height: getDhz2height(ts.bbox.y2 ?? 0, ts.bbox.y1 ?? 0)
          }"
          tabindex="-1"
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
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          <div>Training set</div>
          <div class="mt-3">
            Name: <span class="font-semibold">{{ getTrainingSetsNames(ts.ts) }}</span>
          </div>
          <div>Species: <span class="font-semibold">{{ ts.bbox.species_name }}</span></div>
          <div>Sound: <span class="font-semibold">{{ ts.bbox.songtype_name }}</span></div>
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Templates layer -->
      <div v-show="spectrogramTemplates && layerVisibility.template === true">
        <div
          v-for="(template, index) in spectrogramTemplates"
          :key="index"
          class="border-1 border-[#ffa600] bg-[rgba(255,174,0,0.05)] z-5 cursor-pointer absolute"
          :class="{ 'bg-[rgba(255,174,0,0.2)]': toggledTemplateBox === template.id }"
          :style="{
            left: sec2x(template.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(template.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(template.x2 ?? 0, template.x1 ?? 0, 1),
            height: getDhz2height(template.y2 ?? 0, template.y1 ?? 0)
          }"
          tabindex="-1"
          data-tooltip-style="dark"
          :data-tooltip-target="`tempTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleTemplate(template.id)"
        />
        <!-- Templates Tooltips -->
        <div
          v-for="(template, index) in spectrogramTemplates"
          :id="`tempTooltipId-${index}`"
          :key="`tempTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          <div>Template</div>
          <div class="mt-3">
            Name: <span class="font-semibold">{{ template.name }}</span>
          </div>
          <div>Species: <span class="font-semibold">{{ template.species_name }}</span></div>
          <div>Sound: <span class="font-semibold">{{ template.songtype_name }}</span></div>
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- AED layer -->
      <div v-show="spectrogramAed && layerVisibility.aed === true">
        <div
          v-for="(detection, index) in spectrogramAed"
          :key="index"
          class="border-1 z-5 cursor-pointer absolute"
          :class="{ 'roi-selected': toggledAedBox === detection.aedId }"
          :style="{
            left: sec2x(detection.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(detection.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(detection.x2 ?? 0, detection.x1 ?? 0, 1),
            height: getDhz2height(detection.y2 ?? 0, detection.y1 ?? 0),
            'border-color': detection.borderColor,
            'background-color': detection.backgroundColor
          }"
          tabindex="-1"
          data-tooltip-style="dark"
          :data-tooltip-target="`aedTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleAed(detection.aedId)"
        />
        <!-- AED Tooltips -->
        <div
          v-for="(detection, index) in spectrogramAed"
          :id="`aedTooltipId-${index}`"
          :key="`aedTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          {{ 'AED: ' + detection.name }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Clustering layer -->
      <div v-show="spectrogramClustering && layerVisibility.cluster === true">
        <div
          v-for="(cl, index) in spectrogramClustering"
          :key="index"
          class="border-1 z-5 cursor-pointer absolute"
          :class="{ 'roi-selected': toggledClustering === cl.aedId }"
          :style="{
            left: sec2x(cl.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(cl.y2 ?? 0, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(cl.x2 ?? 0, cl.x1 ?? 0, 1),
            height: getDhz2height(cl.y2 ?? 0, cl.y1 ?? 0),
            'border-color': cl.borderColor,
            'background-color': cl.backgroundColor
          }"
          tabindex="-1"
          data-tooltip-style="dark"
          :data-tooltip-target="`clusterTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleClustering(cl.aedId)"
        />
        <!-- Clustering Tooltips -->
        <div
          v-for="(cl, index) in spectrogramClustering"
          :id="`clusterTooltipId-${index}`"
          :key="`clusterTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          {{ 'Clustering Playlist: ' + cl.playlistName }}
          <div
            class="tooltip-arrow"
            data-popper-arrow
          />
        </div>
      </div>
      <!-- Soundscape Regions layer -->
      <div v-show="spectrogramSoundscapeRegions && layerVisibility.soundscape === true">
        <div
          v-for="(sr, index) in spectrogramSoundscapeRegions"
          :key="index"
          class="border-1 z-5 cursor-pointer absolute"
          :class="{ 'roi-selected': toggledSoundscapeRegion === sr.id, 'invisible': !props.visibleSoundscapes.showBoxes.includes(sr.id) }"
          :style="{
            left: sec2x(sr.x1 ?? 0, 1) + legendMetrics.axis_sizew + 'px',
            top: hz2y(sr.y2 ?? 0, 1, 1) + legendMetrics.axis_margin_top + 'px',
            width: getDsec2width(sr.x2 ?? 0, sr.x1 ?? 0, 1, 1),
            height: getDhz2height(sr.y2 ?? 0, sr.y1 ?? 0, 1, 1),
            'border-color': '#080035',
            'background-color': 'rgba(8, 0, 53, 0.3)'
          }"
          tabindex="-1"
          data-tooltip-style="dark"
          :data-tooltip-target="`soundscapeRegionTooltipId-${index}`"
          @click="$event.stopPropagation(); toggleSoundscapeRegion(sr.id)"
        >
          <span v-if="props.visibleSoundscapes.showAllNames || props.visibleSoundscapes.activeBox === sr.id">
            {{ sr.name }}
          </span>
        </div>
        <!-- Soundscape Regions Tooltips -->
        <div
          v-for="(sr, index) in spectrogramSoundscapeRegions"
          :id="`soundscapeRegionTooltipId-${index}`"
          :key="`soundscapeRegionTooltipKey-${index}`"
          role="tooltip"
          class="absolute z-50 invisible inline-block px-3 py-2 text-sm font-medium text-white dark:bg-moss rounded-lg shadow-sm opacity-0 tooltip"
        >
          {{ 'Soundscape Region: ' + sr.name }}
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

import type { RecordingTagResponse, SoundscapeItem, SoundscapeRegion, TemplateResponse, Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'
import { type RecordingTrainingSet, type RecordingTrainingSetParams, type TrainingSet } from '@rfcx-bio/common/src/api-arbimon/audiodata/training-sets'

import { type AlertDialogType } from '@/_components/alert-dialog.vue'
import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetRecordingTrainingSets, usePostTrainingSet } from '../../_composables/use-training-sets'
import { useGetPatternMatchingBoxes, useGetRecordingTag, useGetSoundscapeRegions, useGetTemplates, usePostTemplate, usePutRecordingTag } from '../../_composables/use-visualizer'
import { type BboxGroupPm, type BboxGroupTags, type BboxGroupTrainingSets, type BboxListItem, type FreqFilter } from '../types'
import { type LayerVisibility } from '../visualizer-page.vue'
import type { VisibleSoundscapes } from './sidebar-soundscape-regions.vue'
import { CreateBBoxEditor } from './visualizer-create-bbox-editor'
import { doXAxisLayout, doYAxisLayout, makeScale } from './visualizer-scale'
import type { AedJob, ClusteringPlaylist } from './visualizer-sidebar.vue'
import VisualizerTagBboxModal from './visualizer-tag-bbox-modal.vue'
import VisualizerTemplateModal, { type TemplateData } from './visualizer-template-modal.vue'
import VisualizerTileImg from './visualizer-tile-img.vue'
import VisualizerTrainingSetBboxModal from './visualizer-training-set-bbox-modal.vue'
import ZoomControl from './zoom-control.vue'

export interface Pointer { sec: number; hz: number }

const props = defineProps<{
  visobject: Visobject | undefined
  visobjectSoundscape?: SoundscapeItem | undefined
  currentTime: number
  freqFilter?: FreqFilter
  isSpectrogramTagsUpdated: boolean
  activeLayer?: string | undefined
  trainingSet: TrainingSet | undefined
  aedJobs: AedJob[] | undefined
  clustering: ClusteringPlaylist[] | undefined
  visibleSoundscapes: VisibleSoundscapes
  layerVisibility: LayerVisibility
}>()

const emits = defineEmits<{(e: 'emitPointer', value: Pointer): void, (e: 'updateTags'): void}>()

const selectedProjectSlug = computed(() => store.project?.slug)
const spectrogramContainer = ref<HTMLElement | null>(null)
const containerSize = reactive({ width: 0, height: 0 })
const spectrogramTileHeight = ref<number>(0)
const axisY = ref<SVGSVGElement | null>(null)
const axisX = ref<SVGSVGElement | null>(null)
const bboxValid = ref(false)
const bboxPointer = reactive<{ x: number; y: number; sec: number; hz: number }>({
  x: 0,
  y: 0,
  sec: 0,
  hz: 0
})

const pointer = reactive<Pointer>({
  hz: 0,
  sec: 0
})

const createBboxEditor = ref(new CreateBBoxEditor())
const spectrogramTags = ref<BboxGroupTags[]>([])
const spectrogramTrainingSets = ref<BboxGroupTrainingSets[]>([])
const spectrogramSoundscapeRegions = ref<SoundscapeRegion[]>([])
const spectrogramPM = ref<BboxGroupPm[]>([])
const spectrogramTemplates = ref<TemplateResponse[]>([])
const toggledTag = ref<number>()
const toggledTrainingSet = ref<number>()
const toggledPmRoiBox = ref<number>()
const toggledTemplateBox = ref<number>()
const toggledAedBox = ref<number>()
const toggledClustering = ref<number>()
const toggledSoundscapeRegion = ref<number>()
const crosshairContainerRef = ref<HTMLElement | null>(null)

const zoomData = reactive<{ x: number; y: number; levelx?: number[]; levely?: number[], maxSec2px: number, maxHz2px: number }>({
  x: 0,
  y: 0,
  levelx: [],
  levely: [],
  maxSec2px: 100 / (1.0 / 8),
  maxHz2px: 100 / (5000.0 / 8)
})

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

const browserTypes: string[] = ['rec', 'playlist', 'soundscape']
const browserTypeId = computed(() => route.params.browserTypeId as string ?? undefined)
const browserType = computed(() => browserTypes.includes(route.params.browserType as string) ? route.params.browserType as string : undefined)
const browserRecId = computed(() => route.params.browserRecId as string ?? undefined)
const browserQuery = computed(() => route.query.a as string ?? undefined)
const bboxQuery = reactive<{ x1: number; y1: number; x2: number; y2: number }>({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
})

const { height: containerHeight, width: containerWidth } = useElementSize(spectrogramContainer)

const isPlaylist = computed(() => browserType.value === 'playlist')
const isSoundscape = computed(() => browserType.value === 'soundscape')

const selectedRecordingId = computed(() => {
  return isPlaylist.value ? isSoundscape.value ? undefined : browserRecId.value : browserTypeId.value
})

const { data: recordingTags, refetch: refetchRecordingTags } = useGetRecordingTag(apiClientArbimon, selectedProjectSlug, selectedRecordingId)
const { data: pmBoxes, refetch: refetchPatternMatchingBoxes } = useGetPatternMatchingBoxes(apiClientArbimon, selectedProjectSlug, { rec_id: selectedRecordingId.value as string, validated: 1 })
const { data: templates, refetch: refetchTemplates } = useGetTemplates(apiClientArbimon, selectedProjectSlug)
const { mutate: mutateAddRecordingTag } = usePutRecordingTag(apiClientArbimon, selectedProjectSlug, browserTypeId)
const { mutate: mutatePostTrainingSet } = usePostTrainingSet(apiClientArbimon, selectedProjectSlug)
const { mutate: mutatePostTemplate } = usePostTemplate(apiClientArbimon, selectedProjectSlug)

const recordingTrainingSetParams = computed<RecordingTrainingSetParams>(() => {
  return {
    recordingId: browserTypeId.value,
    trainingSetId: props.trainingSet ? props.trainingSet.id : ''
  }
})
const { data: trainingSets, refetch: refetchRecordingTrainingSets } = useGetRecordingTrainingSets(apiClientArbimon, selectedProjectSlug, recordingTrainingSetParams)
const { data: soundscapeRegions } = useGetSoundscapeRegions(apiClientArbimon, selectedProjectSlug, browserTypeId)

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

const spectrogramAed = computed(() => props.aedJobs?.flatMap(j => j.items) ?? [])
const spectrogramClustering = computed(() => props.clustering?.flatMap(cl => cl.items) ?? [])

const round = (val: number, precision = 1) => {
  precision = precision || 1
  return (((val / precision) | 0) * precision) || 0
}

const linearInterpolate = (x: number, levels: number[]) => {
  const l = x * (levels.length - 1)
  const f = Math.floor(l)
  const c = Math.ceil(l)
  const m = l - f

  return levels[f] * (1 - m) + levels[c] * m
}

const interpolate = linearInterpolate

const spectrogramMetrics = computed(() => {
  const width = containerSize.width
  const height = containerSize.height
  let zoomedSpecW
  let zoomedSpecH
  if (props.visobject !== undefined && (zoomData.x !== 0 || zoomData.y !== 0)) {
    const zoomLevelsX = [width / props.visobject.domain.x.span, zoomData.maxSec2px]
    const zoomLevelsY = [height / props.visobject.domain.y.span, zoomData.maxHz2px]
    const zoomSec2px = interpolate(zoomData.x, zoomLevelsX)
    const zoomHz2px = interpolate(zoomData.y, zoomLevelsY)
    zoomedSpecW = Math.max(width, Math.ceil(props.visobject.domain.x.span * zoomSec2px))
    zoomedSpecH = Math.max(height, Math.ceil(props.visobject.domain.y.span * zoomHz2px))
  }

  return {
    legend: { ...legendMetrics.value },
    css: {
      top: legendMetrics.value.axis_lead,
      left: legendMetrics.value.axis_sizew,
      width,
      height
    },
    width: zoomedSpecW === undefined ? width : zoomedSpecW,
    height: zoomedSpecH === undefined ? height : zoomedSpecH
  }
})

const drawChart = () => {
  if (!axisY.value || !axisX.value) return
  axisY.value.innerHTML = ''
  d3.select(axisY.value).selectAll('*').remove()
  axisX.value.innerHTML = ''
  d3.select(axisX.value).selectAll('*').remove()
  if (props.visobject) {
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
  if (props.visobjectSoundscape !== undefined && isSoundscape.value === true) {
    const scale = {
      x: makeScale(props.visobjectSoundscape.domain.x, [0, spectrogramMetrics.value.width]),
      y: makeScale(props.visobjectSoundscape.domain.y, [spectrogramMetrics.value.height, 0]),
      sec2px: 100 / 1.0
    }
    const updatedVisobject = {
      ...props.visobjectSoundscape,
      spectrogram: spectrogramMetrics.value
    }
    updatedVisobject.spectrogram.legend.scale = scale
    doYAxisLayout(axisY, updatedVisobject)
    doXAxisLayout(axisX, updatedVisobject)
  }
}

const getSec2px = (containerWidth: number, xSpan: number): number => {
  spectrogramTileHeight.value = document.getElementById('spectrogramTile0')?.clientHeight ?? 0
  return containerWidth / xSpan
}

const getHz2px = (containerHeight: number, ySpan: number): number => {
  return containerHeight / ySpan
}

const hz2y = (hertz: number, round: number, intervalAlign?: number): number => {
  if (isSoundscape.value === true && props.visobjectSoundscape) {
    hertz = alignToInterval(hertz - props.visobjectSoundscape.offset.hz, props.visobjectSoundscape.domain.y, intervalAlign)
    const h = spectrogramMetrics.value.height ?? 0
    const y = h - hertz * getHz2px(spectrogramMetrics.value.height, props.visobjectSoundscape.domain.y.span)
    return round ? (y ?? 0) : +y
  }
  if (!props.visobject) return 0
  hertz = alignToInterval(hertz - props.visobject.offset.hz, props.visobject.domain.y, intervalAlign)
  const h = spectrogramMetrics.value.height ?? 0
  const y = h - hertz * getHz2px(spectrogramMetrics.value.height, props.visobject.domain.y.span)
  return round ? (y ?? 0) : +y
}

const sec2x = (seconds: number, round: number, intervalAlign?: number) => {
  if (isSoundscape.value === true && props.visobjectSoundscape) {
    seconds = alignToInterval(seconds - props.visobjectSoundscape.offset.sec, props.visobjectSoundscape.domain.x, intervalAlign)
    const x = seconds * getSec2px(spectrogramMetrics.value.width, props.visobjectSoundscape.domain.x.span)
    return round ? (x ?? 0) : +x
  }
  if (!props.visobject) return 0
  seconds = alignToInterval(seconds - props.visobject.offset.sec, props.visobject.domain.x, intervalAlign)
  const x = seconds * getSec2px(spectrogramMetrics.value.width, props.visobject.domain.x.span)
  return round ? (x ?? 0) : +x
}

const dhz2height = (hz1: number, hz2: number, round?: number, inclusive?: number | undefined): number => {
  if (isSoundscape.value === true && props.visobjectSoundscape) {
    if (inclusive !== undefined) {
      hz1 = alignToInterval(hz1, props.visobjectSoundscape.domain.y, 1)
    }
    const h = (hz1 - hz2) * getHz2px(spectrogramMetrics.value.height, props.visobjectSoundscape.domain.y.span)
    return round !== undefined ? (h ?? 0) : +h
  }
  if (!props.visobject) return 0
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

const dsec2width = (seconds1: number, seconds2: number, round?: number | undefined, inclusive?: number | undefined) => {
  if (isSoundscape.value === true && props.visobjectSoundscape) {
    if (inclusive !== undefined) {
      seconds1 = alignToInterval(seconds1, props.visobjectSoundscape.domain.x, 1)
    }
    const w = (seconds1 - seconds2) * getSec2px(spectrogramMetrics.value.width, props.visobjectSoundscape.domain.x.span)
    return round !== undefined ? (w ?? 0) : +w
  }
  if (!props.visobject) return 0
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

const getDsec2width = (t1: number, t0: number, round?: number | undefined, inclusive?: number | undefined): string => {
  return `${dsec2width(t1, t0, round, inclusive)}px`
}

const getDhz2height = (f1: number, f0: number, round?: number | undefined, inclusive?: number | undefined): string => {
  return `${dhz2height(f1, f0, round, inclusive)}px`
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

const onMouseDownRoi = (e: MouseEvent) => {
  setBboxPointer(e)
  createBboxEditor.value.add_point(bboxPointer.sec, bboxPointer.hz)
}

const onMouseMoveRoi = (e: MouseEvent) => {
  setBboxPointer(e)
  createBboxEditor.value.add_tracer_point(bboxPointer.sec, bboxPointer.hz)
}

 const setBboxPointer = (e: MouseEvent) => {
  if (!crosshairContainerRef.value) return
  if ((e.buttons & 1) !== 1) return
  const rect = crosshairContainerRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const clampedX = Math.max(0, Math.min(x, rect.width))
  const clampedY = Math.max(0, Math.min(y, rect.height))
  bboxPointer.sec = x2sec(clampedX)
  bboxPointer.hz = y2hz(clampedY)
 }

const onMouseUpRoi = () => {
  createBboxEditor.value.add_point(bboxPointer.sec, bboxPointer.hz)
  bboxValid.value = true
}

const onKeyUp = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    resetBBox()
    toggledTag.value = undefined
  }
}

const setPointerData = (e: MouseEvent) => {
  const sec = x2sec(e.offsetX)
  const hz = y2hz(e.offsetY)
  pointer.hz = hz
  pointer.sec = sec
  emits('emitPointer', pointer)
}

const resetPointerData = () => {
  pointer.hz = 0
  pointer.sec = 0
  emits('emitPointer', pointer)
}

const resetBBox = (): void => {
  createBboxEditor.value.reset()
  bboxValid.value = false
}

const handleNewTag = (tag: BboxListItem): void => {
  bboxValid.value = false
  mutateAddRecordingTag({
    id: tag.id,
    f0: createBboxEditor.value?.bbox?.y1,
    f1: createBboxEditor.value?.bbox?.y2,
    t0: createBboxEditor.value?.bbox?.x1,
    t1: createBboxEditor.value?.bbox?.x2
   }, {
    onSuccess: async () => {
      refetchRecordingTags()
      showAlertDialog('success', 'Success', 'Tag is added')
      resetBBox()
      emits('updateTags')
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error adding the tag')
      resetBBox()
    }
  })
}

const handleNewTemplate = (templateData: TemplateData): void => {
  bboxValid.value = false
  mutatePostTemplate({
    name: templateData.name,
    recording: browserTypeId.value as string,
    roi: {
      x1: createBboxEditor.value?.bbox?.x1 as number,
      y1: createBboxEditor.value?.bbox?.y1 as number,
      x2: createBboxEditor.value?.bbox?.x2 as number,
      y2: createBboxEditor.value?.bbox?.y2 as number
    },
    songtype: templateData.songtype,
    species: templateData.species
   }, {
    onSuccess: async () => {
      refetchTemplates()
      showAlertDialog('success', 'Success', 'Template is added')
      resetBBox()
    },
    onError: (err) => {
      console.info('err', err)
      showAlertDialog('error', 'Error', 'Error adding the template')
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
      x1: createBboxEditor.value?.bbox?.x1 as number,
      x2: createBboxEditor.value?.bbox?.x2 as number,
      y1: createBboxEditor.value?.bbox?.y1 as number,
      y2: createBboxEditor.value?.bbox?.y2 as number
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

const toggleTemplate = (id: number) => {
  if (toggledTemplateBox.value === id) toggledTemplateBox.value = undefined
  else toggledTemplateBox.value = id
}

const toggleAed = (aedId: number) => {
  if (toggledAedBox.value === aedId) toggledAedBox.value = undefined
  else toggledAedBox.value = aedId
}

const toggleClustering = (aedId: number) => {
  if (toggledClustering.value === aedId) toggledClustering.value = undefined
  else toggledClustering.value = aedId
}

const toggleSoundscapeRegion = (id: number) => {
  if (toggledSoundscapeRegion.value === id) toggledSoundscapeRegion.value = undefined
  else toggledSoundscapeRegion.value = id
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

const fetchRecordingTemplates = (): void => {
  spectrogramTemplates.value = templates.value?.filter((template: TemplateResponse) => {
    return template.recording === +browserTypeId.value
  }) ?? []
}

const parseQueryBox = (): void => {
  if (browserQuery.value !== undefined) {
    const box = browserQuery.value.split(',')
    bboxQuery.x1 = +box[1]
    bboxQuery.y1 = +box[2]
    bboxQuery.x2 = +box[3]
    bboxQuery.y2 = +box[4]
  }
}

watch(() => zoomData.x, () => {
  handleResize()
})

watch(() => zoomData.y, () => {
  drawChart()
})

watch(() => axisY.value, () => {
  drawChart()
  if (trainingSets.value) {
    spectrogramTrainingSets.value = groupByBboxForTrainingSets(trainingSets.value)
  }
  refetchPatternMatchingBoxes()
  fetchSpeciesPresence()
  refetchTemplates()
})

watch(() => props.visobjectSoundscape, async () => {
  drawChart()
  await nextTick()
  initTooltips()
})

watch(() => props.visobject, async () => {
  drawChart()
  await nextTick()
  initTooltips()
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

watch(() => templates.value, async () => {
  fetchRecordingTemplates()
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

watch(() => spectrogramAed.value, async () => {
  await nextTick()
  initTooltips()
})

watch(() => soundscapeRegions.value, async () => {
  if (soundscapeRegions.value === undefined) return
  spectrogramSoundscapeRegions.value = soundscapeRegions.value
  await nextTick()
  initTooltips()
})

watch(() => browserQuery.value, async () => {
  parseQueryBox()
})

watch(() => props.visibleSoundscapes, () => {}, { deep: true })

onMounted(() => {
  containerSize.width = spectrogramContainer.value ? (spectrogramContainer.value.clientWidth - legendMetrics.value.axis_sizew - legendMetrics.value.axis_margin_x) : containerWidth.value - legendMetrics.value.axis_sizew - legendMetrics.value.axis_margin_x
  containerSize.height = spectrogramContainer.value ? (spectrogramContainer.value.clientHeight - legendMetrics.value.axis_sizeh - legendMetrics.value.axis_lead) : containerHeight.value - legendMetrics.value.axis_sizeh - legendMetrics.value.axis_lead
  window.addEventListener('resize', handleResize)
  document.addEventListener('keyup', onKeyUp)
  if (!recordingTags.value) return
  spectrogramTags.value = groupByBbox(recordingTags.value)
  initTooltips()
  parseQueryBox()
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

.zoom-control-group {
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  > .zoom-control-btns {
    top: 262px;
    right: 16px;
    width: 1.5em;
  }
}
</style>
