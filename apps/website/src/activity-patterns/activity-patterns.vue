<template>
  <div>
    <page-title
      page-title="Species Spotlight"
      page-subtitle="An in-depth look at the detections and occupancy trends of a single species"
    >
      <dropdown-menu>
        <dropdown-menu-item
          :disabled="!hasExportData"
          @click="exportDetectionsData"
        >
          <icon-far-file-archive class="mr-2" /> Export as CSV
        </dropdown-menu-item>
      </dropdown-menu>
    </page-title>
    <comparison-list-component
      class="mt-5"
      :can-filter-by-taxon="false"
      @emit-select="onFilterChange"
    />
    <species-selector
      :species-slug="$route.params.speciesSlug"
      @emit-selected-species-changed="onSelectedSpeciesChange"
    />
    <div class="grid grid-cols-6 py-2">
      <div class="col-span-4">
        <div class="flex items-center mb-1">
          <div
            v-if="speciesInformation?.commonName"
            class="text-lg mr-2"
          >
            {{ speciesInformation?.commonName }}
          </div>
          <el-tag
            v-if="riskInformation"
            class="border-none"
            effect="dark"
            :color="riskInformation.color"
          >
            {{ riskInformation.label }} ({{ riskInformation.code }})
          </el-tag>
        </div>
        <species-background-information
          :species="speciesInformation"
        />
        <activity-patterns-metrics
          :metrics="metrics"
          class="mt-5"
        />
      </div>
      <div class="col-span-2 border-l-2 px-4">
        <species-images
          v-if="speciesInformation"
          :species="speciesInformation"
        />
        <spotlight-player
          v-if="speciesInformation?.speciesCall"
          :species-call="speciesInformation.speciesCall"
          class="ml-2"
        />
      </div>
    </div>
    <activity-patterns-predicted-occupancy
      :predicted-occupancy-maps="predictedOccupancyMaps"
      class="mt-5"
    />
    <activity-patterns-by-location
      :datasets="mapDatasets"
      class="mt-5"
    />
    <activity-patterns-by-time
      dom-id="activity-by-time"
      :datasets="timeDatasets"
      class="my-5"
    />
  </div>
</template>
<script src="./activity-patterns.ts" lang="ts"></script>
