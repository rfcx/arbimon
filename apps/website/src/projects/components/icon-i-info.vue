<template>
  <icon-custom-ic-info
    v-if="tooltipText"
    :data-tooltip-target="tooltipId"
    data-tooltip-style="light"
    class="inline-block basis-8 h-4 w-4 cursor-pointer text-insight mt-icon-i mt-3.5px"
  />
  <div
    :id="tooltipId"
    role="tooltip"
    class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
  >
    {{ tooltipText }}
    <div
      class="tooltip-arrow"
      data-popper-arrow
    />
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted } from 'vue'

defineProps<{
  tooltipId: string
  tooltipText?: string
}>()

onMounted(() => {
  initTooltips()
})

</script>
