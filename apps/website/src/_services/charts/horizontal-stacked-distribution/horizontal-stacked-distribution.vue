<template>
  <no-data-panel
    v-if="!hasData"
    class="h-20"
  />
  <div v-else>
    <div class="relative mx-2">
      <div class="absolute w-full h-1 rounded-xl bg-steel-grey-light" />
      <div
        v-for="(bar, idx) in bars"
        :key="'dashboard-richness-percentage-' + bar.name"
        class="absolute h-1 rounded-4xl"
        :style="{ width: bar.width + '%', backgroundColor: bar.color , zIndex: bars.length - idx }"
      />
    </div>
    <div class="pt-3">
      <ul class="list-none">
        <li
          v-for="bar in bars"
          :key="'dashboard-richness-class-' + bar.name"
          class="inline-flex items-baseline text-xs"
        >
          <div
            class="rounded-full w-1.5 h-1.5 self-center mx-2"
            :style="{ backgroundColor: bar.color }"
          />
          {{ bar.name }}
          <span class="ml-1 text-subtle font-light">{{ bar.percentage.toFixed(1) }}%</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" src="./horizontal-stacked-distribution.ts"></script>
