<template>
  <div class="w-full">
    <section-title>
      <template #title>
        <div class="sm:(flex flex-row items-center)">
          <select
            v-model="selectedType"
            class="text-xl text-subtle py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-1 border-dotted focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
          >
            <option
              v-for="item in datasetType"
              :key="'detection-time-selector' + item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
          <span class="text-subtle text-xl ml-2">
            by
          </span>
          <select
            v-model="selectedBucket"
            class="text-xl text-subtle lowercase sm:(ml-2) py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-1 border-dotted focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
          >
            <option
              v-for="bucket in Object.entries(buckets)"
              :key="bucket[0]"
              :value="bucket[0]"
            >
              {{ bucket[1] }}
            </option>
          </select>
        </div>
      </template>
      <template #controls>
        <export-button
          v-if="hasData"
          @click="downloadChart()"
        />
      </template>
    </section-title>
    <line-chart-component
      :dom-id="domId"
      :config="config"
      :datasets="datasetsForSelectedBucket"
    />
  </div>
</template>
<script lang="ts" src="./activity-overview-by-time.ts">
 </script>
