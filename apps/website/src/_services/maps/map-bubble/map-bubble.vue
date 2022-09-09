<template>
  <div>
    <no-data-panel
      v-if="!hasData"
      :style="{ height: `${mapHeight}px` }"
    />
    <div
      v-show="hasData"
      class="relative"
    >
      <div
        :id="mapId"
        class="w-full text-black"
        :style="{ height: `${mapHeight}px` }"
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
