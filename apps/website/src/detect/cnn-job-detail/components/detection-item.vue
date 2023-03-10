<template>
  <div
    class="detection-item-container relative w-18 h-18 border-box-gray bg-box-gray"
    :class="{'border-0': isSelected, 'border-1': !isSelected}"
  >
    <div
      v-if="spectrogramLoading"
      class="absolute top-0 bottom-0 left-0 right-0 w-4 h-4 m-auto"
    >
      <icon-fas-spinner class="animate-spin" />
    </div>
    <div
      v-else-if="spectrogram"
      class="relative"
      :class="{'selected': isSelected}"
      @mouseenter="showCheck = true"
      @mouseleave="showCheck = false"
    >
      <img
        :src="spectrogram"
        @click="toggleDetection($event)"
      >
      <div
        v-if="(showCheck || isSelected)"
        class="absolute text-xs top-1 left-1"
        style="line-height: .5rem"
      >
        <input
          type="checkbox"
          name=""
          class="checkbox w-3 h-3 border-white rounded-full bg-transparent outline-none ring-0 focus:(border-transparent ring-0 ring-offset-0 outline-none)"
          :class="{'checkbox-selected': isSelected}"
          :checked="isSelected"
          @click="toggleDetection($event)"
        >
      </div>
      <div class="absolute text-xs top-0.5 right-0">
        <validation-status
          :value="props.validation"
          :hide-unvalidated="true"
        />
      </div>
    </div>
    <div
      v-else
      class="absolute top-0 bottom-0 left-0 right-0 w-4 h-4 m-auto"
    >
      <icon-custom-image-slash class="text-white" />
    </div>
    <div
      v-if="!spectrogramLoading && spectrogram"
      class="absolute bottom-2 right-2"
    >
      <audio-controller
        :playing="playing"
        :loading="audioLoading"
        size="xs"
        @click="playing ? stop() : play()"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AxiosInstance } from 'axios'
import { Howl } from 'howler'
import { inject, onBeforeUnmount, onMounted, ref, watch, withDefaults } from 'vue'

import { apiBioGetCoreMedia } from '@rfcx-bio/common/api-bio/core-proxy/core-media'

import { apiClientBioKey } from '@/globals'
import type { DetectionEvent } from './types'
import ValidationStatus from './validation-status.vue'

const props = withDefaults(defineProps<{
  spectrogramUrl: string | null
  audioUrl: string | null
  id: number | null,
  validation: string,
  checked: boolean | null
}>(), {
  spectrogramUrl: null,
  audioUrl: null,
  id: null,
  checked: null
})

const emit = defineEmits<{(e: 'emitDetection', detectionId: number, event: DetectionEvent): void}>()

const spectrogramLoading = ref(false)
const audioLoading = ref(false)
const showCheck = ref(false)
const isSelected = ref<boolean>(false)

const apiClientBio = inject(apiClientBioKey) as AxiosInstance
const audio = ref<Howl | null>(null)
const spectrogram = ref<string | null>(null)
const playing = ref(false)

onMounted(async () => {
  spectrogramLoading.value = true
  const spectrogramBlob = props.spectrogramUrl ? await apiBioGetCoreMedia(apiClientBio, props.spectrogramUrl) : null
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
    const audioBlob = props.audioUrl ? await apiBioGetCoreMedia(apiClientBio, props.audioUrl) : null
    audioLoading.value = false

    if (!audioBlob) return
    setAudio(audioBlob)
  }
  audio.value?.play()
}

const stop = () => {
  audio.value?.stop()
}

const toggleDetection = (event: MouseEvent) => {
  isSelected.value = !isSelected.value
  if (props.id === null) return
  emit('emitDetection', props.id, {
    isSelected: isSelected.value,
    isShiftKeyHolding: event.shiftKey,
    isCtrlKeyHolding: event.ctrlKey || event.metaKey
  })
}

</script>
<style lang="scss">
  .selected {
    padding: 3px;
    border-color: transparent;
  }
</style>
