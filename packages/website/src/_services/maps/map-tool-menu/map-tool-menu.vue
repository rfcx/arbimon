<template>
  <div class="float-right">
    <template
      v-for="(item, idx) in mapStyleOptions"
      :key="item.id"
    >
      <button
        class="btn"
        :class="{
          'bg-brand-primary': mapStyle === item.style,
          'rounded-r-none': idx !== mapStyleOptions.length - 1,
          'rounded-l-none': idx !== 0
        }"
        @click="emitMapStyle(item.style)"
      >
        {{ item.name }}
      </button>
    </template>
    <button
      class="btn ml-2"
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
