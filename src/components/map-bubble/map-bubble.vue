<template>
  <div>
    <div
      v-if="!hasData"
      class="h-full flex justify-center items-center text-secondary border-2 border-secondary"
    >
      No data
    </div>
    <div
      v-show="hasData"
      class="relative"
    >
      <div
        :id="mapIdFull"
        class="w-full h-96 text-black"
      />
      <export-button-view
        class="absolute top-2 right-2"
        @click="downloadMapPng()"
      />
    </div>
  </div>
</template>
<script src="./map-bubble.ts" lang="ts"></script>
