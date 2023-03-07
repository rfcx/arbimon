<template>
  <!-- TODO #189 Handle error case -->
  <h3 class="text-lg text-subtle border-b-1 border-subtle pb-1">
    Description
  </h3>
  <div class="mt-4">
    <div v-if="loading">
      <span
        class="inline-block min-h-[1em] w-5/12 loading-shimmer"
      />
      <span
        class="inline-block min-h-[1em] w-9/12 loading-shimmer"
      />
      <span
        class="inline-block min-h-[1em] w-4/12 loading-shimmer"
      />
    </div>
    <species-information-content
      v-else
      :content="information?.description"
      :redirect-url="information?.sourceUrl"
      :source="information?.sourceCite"
    />
  </div>
</template>
<script lang="ts" src="./species-background-information.ts"></script>
