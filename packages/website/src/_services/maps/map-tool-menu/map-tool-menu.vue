<template>
  <div class="taxon-picker flex flex-row items-center">
    <div
      v-if="displayTaxonomies"
      class="flex flex-row"
    >
      <div
        v-for="a in taxons"
        :key="a.name"
      >
        <input
          :id="`species-richness-by-location-taxons-${a.name}`"
          v-model="taxon"
          type="radio"
          :value="a.name"
          class="hidden"
        >
        <label
          :for="`species-richness-by-location-taxons-${a.name}`"
          class="inline-block text-center text-lg w-7 h-7 mr-2"
        >
          {{ a.symbol }}
        </label>
      </div>
    </div>
    <div
      v-for="(item, idx) in mapOptions"
      :key="item.id"
    >
      <button
        class="btn"
        :class="{
          'bg-brand-primary': mapStyle === item.id,
          'rounded-r-none': idx === 0,
          'rounded-l-none': idx === mapOptions.length - 1,
          'mr-2': idx === mapOptions.length - 1
        }"
        @click="setMapStyle(item.id)"
      >
        {{ item.name }}
      </button>
    </div>
    <button
      class="btn"
      @click="emitShowLabelsToggle()"
    >
      <input
        type="checkbox"
        class="mr-2 text-brand-primary focus:(ring-0 outline-none) rounded"
        :checked="isShowLabels"
      >
      Labels
    </button>
  </div>
</template>
<script src="./map-tool-menu.ts" lang="ts"></script>
<style lang="scss" scoped>
.taxon-picker input[type='radio']:checked + label {
  color: #000;
  background-color: #fff;
}
</style>
