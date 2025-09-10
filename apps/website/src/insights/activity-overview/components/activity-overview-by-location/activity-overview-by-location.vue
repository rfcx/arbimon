<template>
  <div class="w-full">
    <section-title>
      <template #title>
        <div class="flex flex-col md:(flex-row items-center) text-subtle gap-2">
          <select
            v-model="selectedType"
            class="text-xl text-subtle py-1 bg-echo font-header border-t-0 border-l-0 border-r-0 border-b-1 border-dashed focus:(border-box-gray border-t-0 border-l-0 border-r-0 border-b-1 ring-0 outline-none)"
          >
            <option
              v-for="item in datasetTypes"
              :key="'detection-location-selector' + item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
          <h2 class="text-subtle text-xl sm:(ml-1)">
            by location
          </h2>
        </div>
      </template>
      <template #controls>
        <map-tool-menu-component
          :map-ground-style="mapGroundStyle"
          :map-statistics-style="mapStatisticsStyle"
          @emit-map-ground-style="propagateMapGroundStyle"
          @emit-map-statistics-style="propagateMapStatisticsStyle"
          @emit-show-labels-toggle="propagateToggleLabels"
        />
      </template>
    </section-title>
    <div class="mt-2">
      <div
        v-for="(dataset, idx) in datasets"
        :key="'activity-overview-by-location-wrapper' + idx"
        class="grid gap-2 mt-2"
        :class="{ [`md:grid-cols-${columnCount}`]: true }"
      >
        <map-base-component
          :key="'activity-overview-by-location-' + idx"
          :dataset="dataset"
          :data-key="selectedType"
          :loading="loading"
          :get-popup-html="getPopupHtml"
          :map-export-name="mapExportName(dataset, selectedType, idx)"
          :map-id="`activity-overview-by-location-${idx}`"
          :map-initial-bounds="mapInitialBounds"
          :map-base-formatter="circleFormatter"
          :map-ground-style="mapGroundStyle"
          :map-statistics-style="mapStatisticsStyle"
          :is-show-labels="isShowLabels"
          :style-non-zero="circleStyles[idx]"
          :map-move-event="mapMoveEvent"
          class="w-full"
          @emit-map-moved="propagateMapMove"
        />
        <div class="flex flex-row justify-between mt-4">
          <circle-legend
            v-if="mapStatisticsStyle === 'circle' && !loading"
            :map-base-formatter="circleFormatter"
            :style-non-zero="circleStyles[idx]"
          />
          <heatmap-legend
            v-else-if="mapStatisticsStyle === 'heatmap' && !loading"
            :max-value="selectedType === 'detectionFrequency' ? dataset.maxValues.detectionFrequency : dataset.maxValues.count"
            :title="selectedType === 'detectionFrequency' ? 'Detection frequency' : 'Number of species'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-overview-by-location.ts"></script>
