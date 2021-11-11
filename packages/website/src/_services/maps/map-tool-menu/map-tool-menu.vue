<template>
  <div class="float-right">
    <template
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
    </template>
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
