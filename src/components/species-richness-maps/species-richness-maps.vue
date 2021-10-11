<template>
  <div
    class="w-full"
  >
    <div class="flex justify-between items-end">
      <h2 class="text-white text-xl">
        Distinct species by site
      </h2>
      <div class="taxon-picker">
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
        <template
          v-for="(item, idx) in mapOptions"
          :key="item.id"
        >
          <button
            class="btn"
            :class="{
              'bg-brand-primary': mapStyleId === item.id,
              'rounded-r-none': idx === 0,
              'rounded-l-none': idx === mapOptions.length - 1,
              'mr-2': idx === mapOptions.length - 1
            }"
            @click="setMapStyle(item.id)"
          >
            {{ item.name }}
          </button>
        </template>
        <button
          class="btn"
          @click="isShowLabels = !isShowLabels"
        >
          <input
            type="checkbox"
            class="mr-2 text-brand-primary focus:(ring-0 outline-none) rounded"
            :checked="isShowLabels"
          >
          Labels
        </button>
      </div>
    </div>
    <no-data-container-view
      v-if="!hasData"
      class="h-32 mt-2"
    />
    <div
      v-show="hasData"
      class="grid gap-2 mt-2"
      :class="{ [`md:grid-cols-${columnCount}`]: true }"
    >
      <map-bubble-component
        v-for="(dataset, idx) in datasets"
        :key="idx"
        :dataset="dataset"
        :taxon="taxon"
        :map-id="idx"
        :map-config="config"
        :map-style="mapStyle"
        :is-show-labels="isShowLabels"
        class="w-full"
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
