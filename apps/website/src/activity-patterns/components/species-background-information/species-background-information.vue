<template>
  <!-- TODO #188 #189 Handle loading and error case -->
  <h3 class="text-lg text-subtle border-b-1 border-subtle pb-1">
    Description
  </h3>
  <div class="mt-4">
    <species-information-content
      :content="information?.description"
      :redirect-url="information?.sourceUrl"
      :source="information?.sourceCite"
    />
  </div>
</template>
<script lang="ts" src="./species-background-information.ts"></script>
