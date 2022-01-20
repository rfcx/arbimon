<template>
  <div class="flex">
    <template
      v-for="(item, idx) in mapStyleOptions"
      :key="item.id"
    >
      <button
        class="btn <md:(btn-icon)"
        :class="{
          'bg-brand-primary': mapStyle === item.style,
          'rounded-r-none': idx !== mapStyleOptions.length - 1,
          'rounded-l-none': idx !== 0
        }"
        @click="emitMapStyle(item.style)"
      >
        <div class="<md:hidden">
          {{ item.name }}
        </div>
        <div>
          <img
            class="md:hidden <md:visible"
            :src="item.icon"
            width="16"
            height="16"
          >
        </div>
      </button>
    </template>
    <button
      class="btn ml-2"
      :class="{ '<md:(bg-brand-primary btn-icon)': isShowLabels }"
      @click="emitShowLabelsToggle()"
    >
      <div class="flex items-center <md:hidden">
        <input
          type="checkbox"
          class="mr-2 text-brand-primary focus:(ring-0 outline-none) rounded"
          :checked="isShowLabels"
        >
        Labels
      </div>
      <div class="md:hidden">
        <icon-fas-tag class="text-xs" />
      </div>
    </button>
  </div>
</template>
<script src="./map-tool-menu.ts" lang="ts"></script>
