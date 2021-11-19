<template>
  <div class="w-full h-96">
    <map-bubble-component
      key="overview-location"
      :dataset="siteMapDataset"
      data-key="site"
      map-id="overview-by-location"
      map-export-name="overview-by-location"
      :get-popup-html="getPopupHtml"
      :map-config="config"
      class="w-full"
      @emit-map-moved="mapMoved"
    />
  </div>
</template>
<script lang="ts" src="./overview-location.ts"></script>
