<template>
  <div>
    <no-data-container-view
      v-if="!hasData"
      class="h-96"
    />
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
