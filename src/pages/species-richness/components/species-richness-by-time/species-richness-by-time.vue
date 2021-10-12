<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Distinct species by time
      </h2>
      <div
        class="mb-2 flex"
      >
        <export-button-view
          v-if="hasData"
          @click="downloadChart()"
        />
        <select
          v-model="selectedBucket"
          class="bg-steel-grey border-box-grey ml-2 pl-2 pt-0.5 pb-1 rounded focus:(border-box-grey ring-0 outline-none)"
        >
          <option
            v-for="bucket in buckets"
            :key="bucket"
            :value="bucket"
          >
            {{ bucket }}
          </option>
        </select>
      </div>
    </div>
    <line-chart-component
      :dom-id="domId"
      :config="config"
      :datasets="datasetsForSelectedBucket"
    />
  </div>
</template>
<script src="./species-richness-by-time.ts" lang="ts"></script>
