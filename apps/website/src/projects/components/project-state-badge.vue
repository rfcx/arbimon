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
        This project is currently view-only. Contact support to restore access.
        <div
          class="tooltip-arrow duration-300"
          data-popper-arrow
        />
      </div>
    </div>
    <!-- FREE PROJECTS GET NO TAG (operator 2026-08-18): free is the default
         state and does not need labelling. Premium/Unlimited keep a tag, now
         in the house green (frequency) that Free used to wear — tier tags are
         informational, not a traffic-light. -->
    <span
      v-if="!isLocked && showTierTag"
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
  isHideTooltip?: boolean
}>()

/** Free (or unknown) renders NO tier tag at all — free is the unlabelled
 * default (operator 2026-08-18). */
const showTierTag = computed(() => {
  const tier = props.projectType?.toLowerCase()
  return tier === 'premium' || tier === 'unlimited'
})

/** Premium + Unlimited share one treatment (they are functionally identical
 * on the backend — identical all-NULL limit rows). PALM + CHIRP (operator
 * 2026-08-18): the first pass used frequency/10 + frequency text, which the
 * operator judged too bright — the lime accent belongs to actions, not
 * informational tags. This filled pill uses the brand's own secondary
 * greens: deep `palm` (#00543B) ground with soft `chirp` (#D2FF8A) text —
 * rich rather than loud, and no new color tokens introduced. */
const tierClass = computed(() =>
  'px-2 py-1 rounded-full text-sm font-bold capitalize leading-none flex items-center justify-center cursor-default h-fit w-fit self-start flex-none bg-palm/60 text-chirp'
)
</script>
