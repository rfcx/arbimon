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
    >
      <div
        :id="mapIdFull"
        class="w-full h-96 text-black"
      />
    </div>
  </div>
</template>
<script src="./map-bubble.ts" lang="ts"></script>
