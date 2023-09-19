<template>
  <div>
    <h3 class="text-lg text-subtle border-b-1 border-subtle pb-1">
      Detected audio
    </h3>
    <div
      v-if="loading"
      class="loading-shimmer h-40 my-4"
    />
    <no-data-panel
      v-else-if="isEmpty"
      class="h-40 my-4"
    />
    <div
      v-else
      class="relative group"
    >
      <button
        class="absolute left-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-grey bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
        @click="scrollContent('left')"
      >
        <icon-custom-chevron-left class="text-xxs m-auto" />
      </button>
      <div
        id="spectrogram-container"
        class="flex overflow-auto scrollbar-hide"
      >
        <div
          v-for="(spectrogram, idx) in spectrograms"
          :key="'spectrogram-' + idx"
          class="my-4 not-first:ml-2"
        >
          <div class="relative w-40">
            <img
              :src="spectrogram"
              class="rounded-md"
            >
            <div class="absolute bottom-2 left-2 right-2">
              <div class="flex justify-between">
                <action-controller action-name="Visualizer">
                  <a :href="speciesCalls[idx].callMediaRedirectUrl">
                    <icon-fa-cubes class="text-md" />
                  </a>
                </action-controller>
                <audio-controller
                  :playing="playing && (playingAudioIndex === idx)"
                  @click="setAudioIndex(idx)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        class="absolute right-2 top-0 bottom-0 z-20 my-auto w-8 h-8 rounded-full invisible bg-box-grey bg-opacity-30 group-hover:(visible shadow-md) hover:(bg-opacity-50) focus:(border-transparent outline-none)"
        @click="scrollContent('right')"
      >
        <icon-custom-chevron-right class="text-xxs m-auto" />
      </button>
      <div
        class="fixed w-72 h-12 inset-x-0 mx-auto z-50 px-4 py-2 bg-steel-grey-light rounded-md transition-all duration-500"
        :class="playing ? 'bottom-4' : '-bottom-12'"
      >
        <div class="h-full flex items-center content-center">
          <audio-controller
            :playing="playing"
            @click="playing ? pause() : play()"
          />
          <div
            class="relative w-full mx-2"
            @click="setAudioPlayProgerss($event)"
          >
            <div
              class="absolute w-full h-1 bg-white opacity-50 rounded-full cursor-pointer"
            />
            <div
              class="absolute h-1 bg-white rounded-full z-51 cursor-pointer"
              :style="{ width: playedProgressPercentage + '%' }"
            />
          </div>
          <div>{{ displayPlayedTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { Howl } from 'howler'
import { type Ref, computed, inject, ref, watch } from 'vue'

import { apiBioGetCoreMedia } from '@rfcx-bio/common/api-bio/core-proxy/core-media'
import { type TaxonSpeciesCallTypes } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { apiClientBioKey } from '@/globals'

type ScrollDirection = 'left' | 'right'

const SCROLL_STEP = 150

const apiClientBio = inject(apiClientBioKey) as AxiosInstance

const audio: Ref<Howl | null> = ref(null)
const audioList: Ref<Howl[]> = ref([])
const spectrograms: Ref<string[]> = ref([])
const loading = ref(true)
const playing = ref(false)
const playingAudioIndex = ref(-1)
const playedTime = ref(0)
const playedProgressPercentage = ref(0)

const props = defineProps<{ speciesCalls: Array<TaxonSpeciesCallTypes['light']> }>()

const isEmpty = computed((): boolean => {
  return props.speciesCalls.length === 0
})

const displayPlayedTime = computed((): string => {
  return `${dayjs.duration(playedTime.value, 'seconds').format('m:ss')}`
})

watch(props.speciesCalls, async () => {
  await getSpeciesCallAssets()
})

const getSpeciesCallAssets = async (): Promise<void> => {
  loading.value = true
  await Promise.all([
    getSpectrogramImage(),
    getAudio()
  ])
  loading.value = false
}

const getSpectrogramImage = async (): Promise<void> => {
  const spectrogramList = (await Promise.all(props.speciesCalls.map(async ({ callMediaSpecUrl }) => await apiBioGetCoreMedia(apiClientBio, callMediaSpecUrl)))).filter(isDefined)
  spectrograms.value = spectrogramList.map(data => window.URL.createObjectURL(data))
}

const getAudio = async (): Promise<void> => {
  const audios = (await Promise.all(props.speciesCalls.map(async ({ callMediaWavUrl }) => await apiBioGetCoreMedia(apiClientBio, callMediaWavUrl)))).filter(isDefined)

  audioList.value = audios.map(data => {
    return new Howl({
      src: [window.URL.createObjectURL(data)],
      html5: true,
      onend: () => {
        playing.value = false
        playingAudioIndex.value = -1
      },
      onpause: () => {
        playing.value = false
      },
      onplay: () => {
        playing.value = true
        requestAnimationFrame(step)
      },
      onstop: () => {
        playing.value = false
      }
    })
  })
  audio.value = audioList.value.length > 0 ? audioList.value[0] : null
}

const step = (): void => {
  const seek = audio.value?.seek() ?? 0
  if (audio.value?.playing() ?? false) {
    playedTime.value = seek
    playedProgressPercentage.value = (seek / (audio.value?.duration() ?? 0)) * 100
    requestAnimationFrame(step)
  }
}

const setAudioPlayProgerss = (event: MouseEvent): void => {
  const target = event.currentTarget as HTMLDivElement
  const targetWidth = target.offsetWidth
  const offsetX = event.offsetX
  const playedProgress = (offsetX / targetWidth)
  playedProgressPercentage.value = playedProgress * 100
  selectedDuration(playedProgress)
}

const selectedDuration = (progress: number): void => {
  const selectedTime = (audio.value?.duration() ?? 0) * progress
  playedTime.value = selectedTime
  audio.value?.seek(selectedTime)
  audio.value?.play()
}

const setAudioIndex = async (idx: number): Promise<void> => {
  if (playingAudioIndex.value !== idx) {
    if (playing.value) {
      await stop()
    }
    playingAudioIndex.value = idx
    audio.value = audioList.value[idx]
    await play()
    playing.value = true
  } else {
    if (playing.value) {
      await pause()
    } else {
      await play()
    }
  }
}

const play = async (): Promise<void> => {
  audio.value?.play()
}

const pause = async (): Promise<void> => {
  audio.value?.pause()
}

const stop = async (): Promise<void> => {
  audio.value?.stop()
}

const scrollContent = (direction: ScrollDirection = 'left'): void => {
  const content = document.querySelector('#spectrogram-container')
  if (!content) return

  if (direction === 'left') {
    content.scrollLeft -= SCROLL_STEP
  } else {
    content.scrollLeft += SCROLL_STEP
  }
}
</script>
