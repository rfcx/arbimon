<template>
  <div
    id="accordion-collapse-ss"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div
      id="accordion-collapse-heading-ss"
      data-accordion="open"
      class="flex justify-between items-center"
    >
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-ss"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-ss"
      >
        <div>
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span class="ml-1 text-sm font-semibold">{{ item.name }}</span>
        </div>
      </button>
    </div>
    <div
      id="accordion-collapse-body-ss"
      class="hidden flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-ss"
    >
      <div class="w-full text-insight">
        <div class="mt-2 text-sm">
          <div class="grid grid-cols-[200px_1fr] items-center py-2 border-b border-[#3a392f]">
            <div class="text-secondary/80">
              Aggregation
            </div>
            <div class="font-medium">
              {{ aggregationLabel }}
            </div>
          </div>

          <div class="grid grid-cols-[200px_1fr] items-center py-2 border-b border-[#3a392f]">
            <div class="text-secondary/80">
              Bin Size
            </div>
            <div class="font-medium">
              {{ item.bin_size }} Hz
            </div>
          </div>

          <div class="grid grid-cols-[200px_1fr] items-center py-2 border-b border-[#3a392f]">
            <div class="text-secondary/80">
              Frequency
            </div>
            <div class="font-medium">
              {{ freqRange }}
            </div>
          </div>

          <div class="grid grid-cols-[200px_1fr] items-center py-2 border-b border-[#3a392f]">
            <div class="text-secondary/80">
              Visualization Scale
            </div>
            <div class="font-medium">
              {{ item.normalized ? 'Normalized' : '0 - ' + item.max_value + ' (auto)' }}
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="grid grid-cols-[200px_1fr] items-center py-2">
              <div class="text-secondary/80">
                Amplitude Threshold
              </div>
              <div>
                <div class="font-medium">
                  {{ item.threshold }}
                </div>
                <div class="mt-0.5">
                  {{ thresholdType }}
                </div>
              </div>
            </div>
            <div
              class="cursor-pointer"
              title="Edit Visualization Options"
              @click="$event.stopPropagation();toggleOptions()"
            >
              <icon-custom-fi-wrench
                class="h-4 w-4"
              />
            </div>
            <SoundscapeOptions
              :soundscape="item"
              :visible="toggleVisible"
              :soundscape-scidx="soundscapeScidx"
              :soundscape-norm-vector="soundscapeNormVector"
              @emit-options="$emit('emitSoundscapeOptions', $event)"
              @cancel="toggleVisible = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import { initAccordions } from 'flowbite'
import { computed, inject, onMounted, ref } from 'vue'

import type { SoundscapeItem, SoundscapeItemOptions } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetSoundscapeNormVector, useGetSoundscapeScidx } from '../../_composables/use-visualizer'
import SoundscapeOptions from './sidebar-soundscape-options-modal.vue'

const props = defineProps<{ item: SoundscapeItem }>()

defineEmits<{(e: 'emitSoundscapeOptions', value: SoundscapeItemOptions): void}>()

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const { data: soundscapeScidx } = useGetSoundscapeScidx(apiClientArbimon, selectedProjectSlug, computed(() => props.item.id.toString()))
const { data: soundscapeNormVector } = useGetSoundscapeNormVector(apiClientArbimon, selectedProjectSlug, computed(() => props.item.id.toString()))

const toggleVisible = ref<boolean>(false)

const toTitle = (s: string) =>
  s.replace(/[_-]+/g, ' ')
   .replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1))

const fmtKHz = (hz: number) => {
  const khz = hz / 1000
  return Number.isInteger(khz) ? `${khz} kHz` : `${khz.toFixed(2)} kHz`
}

const aggregationLabel = computed(() =>
  props.item.aggr_name?.trim() ? props.item.aggr_name : toTitle(props.item.aggregation)
)

const freqRange = computed(() =>
  `${fmtKHz(props.item.min_f)} - ${fmtKHz(props.item.max_f)}`
)

const thresholdType = computed(() => toTitle(props.item.threshold_type))

const toggleOptions = () => {
  toggleVisible.value = !toggleVisible.value
}

onMounted(() => {
  initAccordions()
})
</script>
