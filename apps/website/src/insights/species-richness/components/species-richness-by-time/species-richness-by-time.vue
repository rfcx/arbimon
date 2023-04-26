<template>
  <div class="w-full">
    <section-title>
      <template #title>
        <div class="sm:(flex flex-row items-center)">
          <h2 class="text-subtle text-xl">
            Distinct species by
          </h2>
          <select
            v-model="selectedBucket"
            class="text-xl text-subtle lowercase py-1 bg-mirage-gray border-t-0 border-l-0 border-r-0 border-b-1 border-dotted md:(ml-2) focus:(border-box-gray border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
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
      :loading="loading"
      class="mt-2"
    />
  </div>
</template>
<script src="./species-richness-by-time.ts" lang="ts"></script>
