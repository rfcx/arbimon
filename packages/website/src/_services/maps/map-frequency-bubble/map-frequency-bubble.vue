<template>
  <div>
    <no-data-panel
      v-if="!hasData"
      class="h-96"
    />
    <div
      v-show="hasData"
      class="relative"
    >
      <div
        :id="mapId"
        class="w-full h-96 text-black"
      />
      <export-button
        class="absolute top-2 right-2"
        @click="downloadMapPng()"
      />
    </div>
  </div>
</template>
<script src="./map-frequency-bubble.ts" lang="ts"></script>
