<template>
  <div class="flex flex-wrap gap-1 ml-3">
    <span
      v-if="isLocked"
      class="px-2 py-1 rounded-full text-sm font-bold capitalize leading-none bg-white/70 text-pitch flex items-center justify-center"
    >
      view-only
    </span>
    <span
      v-if="!isLocked && projectType"
      :class="tierClass"
    >
      {{ projectType }}
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
