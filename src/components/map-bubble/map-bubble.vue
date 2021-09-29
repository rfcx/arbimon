<template>
  <div
    id="map-bubble-component"
    class="w-full"
  >
    <div
      v-if="!hasData"
      class="no-chart-data text-center text-white"
    >
      No data
    </div>
    <div
      v-show="hasData"
    >
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
      <div
        id="map-bubble"
        class="w-full h-96 text-black"
      />
    </div>
  </div>
</template>
<script src="./map-bubble.ts" lang="ts" />
<style lang="scss" scoped>
.taxon-picker {
  float: right;
}

.taxon-picker input[type='radio']:checked + label {
  color: #000;
  background-color: #fff;
}
</style>
