<template>
  <div
    class="w-full"
  >
    <div class="flex flex-row items-center">
      <select
        v-model="selectedType"
        class="text-xl py-1 bg-mirage-grey border-t-0 border-l-0 border-r-0 border-b-2 focus:(border-box-grey border-t-0 border-l-0 border-r-0 border-b-2 ring-0 outline-none)"
      >
        <option
          v-for="item in datasetTypes"
          :key="'location-dataset-selector' + item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
      <h2 class="text-white text-xl ml-1">
        by site
      </h2>
    </div>
    <div
      class="grid gap-2 mt-2"
      :class="{ [`md:grid-cols-${columnCount}`]: true }"
    >
      <map-frequency-bubble-component
        v-for="(dataset, idx) in datasets"
        :key="idx"
        :dataset="dataset"
        :map-id="`activity-patterns-by-location-${idx}`"
        :map-config="config"
        :map-style="mapStyle"
        :map-export-name="mapExportName(dataset)"
        :is-show-labels="isShowLabels"
        class="w-full"
        @emitMapMoved="mapMoved"
      />
    </div>
  </div>
</template>
<script src="./activity-patterns-by-location.ts" lang="ts"></script>
