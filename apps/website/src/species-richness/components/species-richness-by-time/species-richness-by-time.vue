<template>
  <div class="w-full">
    <section-title>
      <template #title>
        <div class="flex flex-row items-center">
          <h2 class="text-white text-xl">
            Distinct species by
          </h2>
          <select
            v-model="selectedBucket"
            class="text-xl lowercase ml-2 py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
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
<script src="./species-richness-by-time.ts" lang="ts"></script>
