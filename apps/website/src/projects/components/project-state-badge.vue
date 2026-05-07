<template>
  <div class="flex flex-wrap gap-1">
    <div
      v-if="isLocked"
      class="relative group"
    >
      <span
        class="px-2 py-1 rounded-full text-sm font-bold capitalize leading-none bg-white/70 text-pitch flex items-center justify-center cursor-default"
      >
        view-only
      </span>

      <div
        v-if="isHideTooltip !== true"
        class="absolute z-9999 inline-block px-3 py-2 text-sm font-medium text-gray-900
             transition-opacity transition-all duration-200 bg-white rounded-lg shadow-sm
             opacity-0 invisible
             group-hover:opacity-100 group-hover:visible
             left-1/2 -translate-x-1/2 bottom-full mb-2 w-max whitespace-nowrap"
      >
        This project is now View Only due to inactivity. Upgrade your plan to restore access.
        <div
          class="tooltip-arrow duration-300"
          data-popper-arrow
        />
      </div>
    </div>
    <span
      v-if="!isLocked"
      :class="tierClass"
    >
      {{ projectType ?? 'Free' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  projectType?: string
  isLocked?: boolean
  isHideTooltip?: boolean
}>()

const tierClass = computed(() => {
  const tier = props.projectType?.toLowerCase() ?? 'free'
  const base = 'px-2 py-1 rounded-full text-sm font-bold capitalize leading-none flex items-center justify-center cursor-default h-fit w-fit self-start flex-none'
  switch (tier) {
    case 'premium':
      return `${base} bg-amber-100/20 text-amber-700`
    case 'unlimited':
      return `${base} bg-rose-100/20 text-rose-700`
    case 'free':
    default:
      return `${base} bg-frequency/10 text-frequency`
  }
})
</script>
