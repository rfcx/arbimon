<template>
  <div class="w-full">
    <map-bubble-component
      v-if="dataset"
      :dataset="dataset"
      data-key="site"
      :get-popup-html="getPopupHtml"
      map-id="overview-sitemap"
      :map-config="config"
      map-export-name="overview-sitemap"
      max-circle-radius-pixels="5.0"
      class="w-full"
      @emit-map-moved="mapMoved"
    />
  </div>
</template>
<script src="./overview-sitemap.ts" lang="ts"></script>
