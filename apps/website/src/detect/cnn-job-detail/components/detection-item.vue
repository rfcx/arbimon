<template>
  <div class="detection-item aspect-[2.5/1]">
    <div
      class="relative rounded-md bg-echo border-1 border-util-gray-02 w-72 h-30"
      :class="{'border-transparent': (isSelected || highlightBorder) && store.userIsExpertMember}"
    >
      <div
        v-if="spectrogramLoading"
        class="absolute top-0 bottom-0 left-0 right-0 w-4 h-4 m-auto"
      >
        <icon-custom-ic-loading class="animate-spin w-6 h-6" />
      </div>
      <div
        v-else-if="spectrogram"
        class="relative"
        @mouseenter="highlightBorder = true"
        @mouseleave="highlightBorder = false"
      >
        <img
          :src="spectrogram"
          class="w-72 h-30 rounded-md object-cover object-center"
          :class="{'border-transparent': (!isSelected || !highlightBorder) && store.userIsExpertMember, 'rounded-md border-2 border-chirp': (isSelected || highlightBorder) && store.userIsExpertMember }"
          @click="toggleDetection($event)"
        >
        <div
          v-if="store.userIsExpertMember"
          class="absolute text-xs top-2.5 left-2.5"
          style="line-height: 1.8rem; width:1.8rem; text-align: center;"
        >
          <input
            type="checkbox"
            class="cursor-pointer w-5 h-5 border-3 border-insight rounded-sm bg-transparent outline-none ring-0 focus:(ring-0 border-insight ring-offset-0 outline-none)"
            :checked="isSelected"
            @click="toggleDetection($event)"
          >
        </div>
        <div class="absolute top-2.5 right-3">
          <validation-status
            :value="props.validation ?? 'unreviewed'"
            :hide-unvalidated="true"
          />
        </div>
      </div>
      <div
        v-else
        class="absolute top-0 bottom-0 left-0 right-0 w-4 h-4 m-auto"
      >
        <icon-custom-image-slash class="text-insight w-6 h-6" />
      </div>
      <div
        v-if="!spectrogramLoading && spectrogram"
        class="absolute bottom-3 right-3 cursor-pointer"
      >
        <audio-controller
          :playing="playing"
          :loading="audioLoading"
          size="sm"
          @click="playing ? stop() : play()"
        />
      </div>
      <div
        v-if="!spectrogramLoading && spectrogram"
        class="absolute bottom-2 left-2 cursor-pointer"
        @click="onVisualizerRedirect"
      >
        <icon-custom-fi-visualizer-redirect class="w-6.3 h-6.3" />
      </div>
    </div>
    <div class="flex flex-col pt-2 gap-y-2 text-insight text-[13px]">
      <div class="flex text-ellipsis overflow-hidden">
        <span
          v-if="props.score"
          class="whitespace-nowrap"
        >
          Score: {{ props.score }}
        </span>
        <div class="mx-2 border-l-2 border-util-gray-03" />
        <div
          v-if="props.site"
          class="whitespace-nowrap text-ellipsis overflow-hidden"
          :title="'Site: ' + props.site"
        >
          Site: {{ props.site }}
        </div>
      </div>
      <span v-if="props.start">{{ dateFormatted(props.start ?? '') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import { Howl } from 'howler'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { apiArbimonLegacyFindRecording } from '@rfcx-bio/common/api-arbimon/recordings-query'
import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { apiCoreGetMedia } from '@rfcx-bio/common/api-core/media/core-media'

import { apiClientArbimonLegacyKey, apiClientMediaKey } from '@/globals'
import { useStore } from '~/store'
import type { DetectionEvent } from './types'
import ValidationStatus from './validation-status.vue'

const props = withDefaults(defineProps<{
  spectrogramUrl: string
  audioUrl: string,
  id: number | null,
  validation: ArbimonReviewStatus,
  checked: boolean | null,
  score?: number | undefined,
  start?: string | undefined,
  site?: string | undefined,
  selectedGrouping?: string | undefined,
  siteIdCore?: string | undefined
}>(), {
  id: null,
  checked: null,
  score: undefined,
  start: undefined,
  site: undefined,
  selectedGrouping: undefined
})

const emit = defineEmits<{(e: 'emitDetection', detectionId: number, event: DetectionEvent): void}>()
const store = useStore()

const spectrogramLoading = ref(false)
const audioLoading = ref(false)
const highlightBorder = ref(false)
const isSelected = ref<boolean>(false)

const apiMedia = inject(apiClientMediaKey) as AxiosInstance
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance

const audio = ref<Howl | null>(null)
const spectrogram = ref<string | null>(null)
const playing = ref(false)

onMounted(async () => {
  spectrogramLoading.value = true
  const spectrogramBlob = await apiCoreGetMedia(apiMedia, { filename: props.spectrogramUrl })
  spectrogramLoading.value = false

  if (!spectrogramBlob) return
  spectrogram.value = window.URL.createObjectURL(spectrogramBlob)
})

onBeforeUnmount(() => {
  if (spectrogram.value) {
    window.URL.revokeObjectURL(spectrogram.value)
  }
})

watch(() => props.validation, () => {
  isSelected.value = false
})

watch(() => props.checked, () => {
  if (props.checked === null) return
  isSelected.value = props.checked
})

const setAudio = (audioBlob: Blob) => {
  audio.value = new Howl({
    src: window.URL.createObjectURL(audioBlob),
    html5: true,
      onend: () => {
        playing.value = false
      },
      onpause: () => {
        playing.value = false
      },
      onplay: () => {
        playing.value = true
      },
      onstop: () => {
        playing.value = false
      }
  })
}

const play = async () => {
  if (!audio.value) {
    audioLoading.value = true
    const audioBlob = await apiCoreGetMedia(apiMedia, { filename: props.audioUrl })
    audioLoading.value = false

    if (!audioBlob) return
    setAudio(audioBlob)
  }
  audio.value?.play()
}

const stop = () => {
  audio.value?.stop()
}

const onVisualizerRedirect = async (): Promise<void> => {
  if (!props.start || !props.siteIdCore) return
  const response = await apiArbimonLegacyFindRecording(apiClientArbimon, store.project?.slug ?? '', { start: props.start, site_external_id: props.siteIdCore })
  if (response === null) return
  window.location.assign(`${window.location.origin}/project/${store.project?.slug}/visualizer/rec/${response}`)
}

const toggleDetection = (event: MouseEvent) => {
  if (!store.userIsExpertMember) return
  isSelected.value = !isSelected.value
  if (props.id === null) return
  emit('emitDetection', props.id, {
    isSelected: isSelected.value,
    isShiftKeyHolding: event.shiftKey,
    isCtrlKeyHolding: event.ctrlKey || event.metaKey
  })
}

const dateFormatted = (date: string) => {
  if (!date.length) return ''
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss A')
}

</script>

<style lang="scss">
  .dark .detection-item [type=checkbox]:checked {
    color: #060508 !important;
    opacity: 0.8;
    border: 3px solid #FFFEFC !important;
    background-image: url("data:image/svg+xml,%3Csvg width='13' height='10' viewBox='0 0 13 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11.5 1.25L4.625 8.125L1.5 5' stroke='%23ADFF2C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
  }
  .relative:hover .absolute.text-xs.top-2\.5.left-2\.5{
    background-color: #4B4B4B80 !important;
    border-radius: 5px;
  }
</style>
