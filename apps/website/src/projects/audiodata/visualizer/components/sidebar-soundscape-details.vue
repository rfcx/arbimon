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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initAccordions } from 'flowbite'
import { computed, onMounted } from 'vue'

import type { SoundscapeItem } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

const props = defineProps<{ item: SoundscapeItem }>()

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

onMounted(() => {
  initAccordions()
})
</script>
