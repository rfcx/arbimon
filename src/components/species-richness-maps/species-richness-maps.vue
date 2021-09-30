<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Number of species detected at each site
        <button
          class="btn mx-2 px-2 py-0"
          @click="displayLabel = !displayLabel"
        >
          🖊️
        </button>
        <button
          class="btn px-2 py-0"
          @click="displaySatellite = !displaySatellite"
        >
          🎨
        </button>
      </h2>
      <div class="taxon-picker mb-2">
        <template
          v-for="a in taxons"
          :key="a.name"
        >
          <input
            :id="`taxons-${a.name}`"
            v-model="taxon"
            type="radio"
            :value="a.name"
            class="hidden"
          >
          <label
            :for="`taxons-${a.name}`"
            class="inline-block text-center text-lg w-7 h-7 mr-2"
          >
            {{ a.symbol }}
          </label>
        </template>
      </div>
    </div>
    <div
      v-if="!hasData"
      class="text-center text-white"
    >
      No data
    </div>
    <div
      v-show="hasData"
      class="grid gap-2"
      :class="{ [`md:grid-cols-${columnCount}`]: true }"
    >
      <map-bubble-component
        v-for="(dataset, idx) in datasets"
        :key="idx"
        :dataset="dataset"
        :taxon="taxon"
        :map-id="idx"
        :map-config="config"
        class="w-full h-96 "
        :map-style="mapStyle"
        :map-label="displayLabel"
        @mapMoved="mapMoved"
      />
    </div>
  </div>
</template>
<script src="./species-richness-maps.ts" lang="ts"></script>
<style lang="scss" scoped>
.taxon-picker {
  float: right;
}

.taxon-picker input[type='radio']:checked + label {
  color: #000;
  background-color: #fff;
}
</style>
