<template>
  <section class="bg-white dark:bg-pitch border-y-1 border-frequency bg-hero-data bg-cover bg-no-repeat bg-bottom-right">
    <div class="flex flex-col items-center justify-between lg:flex-row lg:py-10 px-4 py-20 gap-10 max-w-screen-xl mx-auto">
      <div class="px-4 lg:w-96">
        <h5>
          Research advancing the
          understanding of the natural world.
        </h5>
      </div>
      <div class="grid grid-cols-2 gap-4 grid-flow-row">
        <icon-fas-spinner
          v-if="isLoading"
          class="animate-spin w-8 h-8 lg:mx-24 mx-12"
        />
        <number-stat
          v-else
          :number="props.countPublication"
          title="Papers published"
        />
        <icon-fas-spinner
          v-if="isLoading"
          class="animate-spin w-8 h-8 lg:mx-24 mx-12"
        />
        <number-stat
          v-else
          :number="props.countCitation"
          title="Total citations"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NumberStat from '../../home/components/number-stat.vue'

const props = withDefaults(defineProps<{
  countCitation: number
  countPublication: number
  isLoading: boolean
}>(), {
  isLoading: true
})
</script>
