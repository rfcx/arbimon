<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Distinct species by time
      </h2>
      <div class="mb-2">
        <select
          v-model="period"
          class="bg-steel-grey rounded py-1 pl-2 pr-4 focus:(border-box-grey ring-0 outline-none)"
        >
          <option
            v-for="period in periods"
            :key="period"
            :value="period"
          >
            {{ period }}
          </option>
        </select>
      </div>
    </div>
    <line-chart-component
      :dom-id="domId"
      :config="config"
      :datasets="datasetsForPeriod"
    />
  </div>
</template>
<script src="./species-richness-by-time.ts" lang="ts"></script>
