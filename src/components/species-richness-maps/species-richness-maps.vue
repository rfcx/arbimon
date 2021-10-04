<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end mb-1.5">
      <h2 class="text-white text-xl">
        Number of species detected at each site
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
        <button
          class="py-2 px-4 rounded-l-lg bg-box-grey hover:bg-box-grey-dark focus:(ring-0 outline-none)"
          :class="{ 'bg-brand-primary': mapStyleId === 'satellite-streets-v11' }"
          @click="setMapStyle('satellite-streets-v11')"
        >
          Satellite
        </button>
        <button
          class="py-2 px-4 rounded-r-lg bg-box-grey hover:bg-box-grey-dark focus:(ring-0 outline-none) mr-2"
          :class="{ 'bg-brand-primary': mapStyleId === 'streets-v11' }"
          @click="setMapStyle('streets-v11')"
        >
          Streets
        </button>
        <button
          class="btn align-middle"
          @click="isShowLabels = !isShowLabels"
        >
          <input
            type="checkbox"
            class="mr-2 text-brand-primary focus:(ring-0 outline-none)"
            :checked="isShowLabels"
          >
          Labels
        </button>
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
        :is-show-labels="isShowLabels"
        @emitMapMoved="mapMoved"
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
