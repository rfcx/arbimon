<template>
  <div>
    <no-data-panel
      v-if="!hasData"
      class="h-192"
    />
    <div
      v-show="hasData"
      class="relative"
    >
      <div
        :id="mapId"
        class="w-full h-192 text-black"
      />
      <div
        v-if="dataset.title"
        class="absolute text-lg bg-white top-2 left-2"
      >
        {{ dataset.title }}
      </div>
      <export-button
        class="absolute top-2 right-2"
        @click="downloadMapPng()"
      />
    </div>
  </div>
</template>
<script src="./map-bubble.ts" lang="ts"></script>
