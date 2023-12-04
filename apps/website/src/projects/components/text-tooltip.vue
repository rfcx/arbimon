<template>
  <span
    v-if="tooltipText"
    :data-tooltip-target="tooltipId"
    data-tooltip-style="light"
    class="ml-1 w-6"
  >
    {{ tooltipText }}
  </span>
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
