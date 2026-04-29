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
        class="absolute z-10 inline-block px-3 py-2 text-sm font-medium text-gray-900
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
}>()

const tierClass = computed(() => {
  const tier = props.projectType?.toLowerCase() ?? 'free'
  const base = 'inline-flex items-center justify-center w-fit rounded-full px-2 py-1 text-sm font-bold capitalize tracking-wide leading-none'

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
