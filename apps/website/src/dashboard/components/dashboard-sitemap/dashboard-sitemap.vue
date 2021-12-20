<template>
  <div class="w-full">
    <map-bubble-component
      v-if="dataset"
      :dataset="dataset"
      data-key="site"
      :get-popup-html="getPopupHtml"
      map-id="dashboard-sitemap"
      :map-initial-bounds="store.selectedProject?.geoBounds ?? null"
      :map-move-event="mapMoveEvent"
      map-export-name="dasboard-sitemap"
      :max-circle-radius-pixels="5.0"
      class="w-full"
      @emit-map-moved="propagateMapMove"
    />
  </div>
</template>
<script src="./dashboard-sitemap.ts" lang="ts"></script>
