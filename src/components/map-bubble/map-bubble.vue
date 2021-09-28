<template>
  <div
    id="map-bubble-component"
    class="w-full"
  >
    <div
      v-if="noData"
      class="no-chart-data text-center text-white"
    >
      No data
    </div>
    <div
      v-show="!noData"
    >
      <select
        v-model="taxon"
        class="bg-dark-50 text-white"
      >
        <option
          v-for="taxon in taxons"
          :key="taxon"
          :value="taxon"
        >
          {{ taxon }}
        </option>
      </select>
      <div
        id="map-bubble"
        class="w-full h-96 bg-white"
      />
    </div>
  </div>
</template>
<script src="./map-bubble.ts" lang="ts" />
