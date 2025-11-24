<template>
  <div
    id="accordion-collapse-soundscape-regions"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div
      id="accordion-collapse-heading-soundscape-regions"
      data-accordion="open"
      class="flex justify-between items-center"
    >
      <button
        type="button"
        class="flex justify-start items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-soundscape-regions"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-soundscape-regions"
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
          <span class="ml-1 text-sm font-bold">Soundscape Regions</span>
        </div>
      </button>
    </div>
    <div
      id="accordion-collapse-body-soundscape-regions"
      class="hidden w-[95%] flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-soundscape-regions"
    >
      <div class="flex flex-row ml-auto">
        <icon-fa-crosshairs class="w-[10px] mr-2" />
        {{ pointer }}
      </div>
      <div>There are no regions defined in this soundscape.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initAccordions } from 'flowbite'
import { onMounted } from 'vue'

const pointer = '0:00, 2.62 kHz'
// TODO: add pointer number

onMounted(() => {
  initAccordions()
})
</script>
