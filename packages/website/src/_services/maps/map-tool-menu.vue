<template>
  <div class="taxon-picker">
    <template
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
      @click="emitShowLabelToggle()"
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
<script lang="ts">import { Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

import { TAXONOMY_CLASSES } from '../api/taxonomy-service'

interface MapOptions {
  id: string
  name: string
}

export default class MapToolMenuView extends Vue {
  @Emit()
  emitShowLabelToggle (): boolean {
    this.isShowLabels = !this.isShowLabels
    return this.isShowLabels
  }

  get mapOptions (): MapOptions[] {
    return [
      { id: 'satellite-streets-v11', name: 'Satellite' },
      { id: 'streets-v11', name: 'Streets' }
    ]
  }

isShowLabels = false
  mapStyleId = 'satellite-streets-v11'
  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name

  setMapStyle (id: string): void {
    this.mapStyleId = id
  }
}
</script>
<style lang="scss" scoped>
.taxon-picker input[type='radio']:checked + label {
  color: #000;
  background-color: #fff;
}
</style>
