<template>
  <div class="w-full">
    <div class="flex flex-row justify-between items-center">
      <div class="flex flex-row items-center">
        <select
          v-model="selectedType"
          class="text-xl py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
        >
          <option
            v-for="item in datasetType"
            :key="'detection-time-selector' + item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
        <h2 class="text-white text-xl ml-2">
          by
        </h2>
        <select
          v-model="selectedBucket"
          class="text-xl capitalize ml-2 py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
        >
          <option
            v-for="item in buckets"
            :key="'detection-time-selector' + item"
            :value="item"
          >
            {{ item }}
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
<script lang="ts" src="./activity-patterns-by-time.ts"></script>
