<template>
  <div class="grid grid-cols-4">
    <div class="col-span-3 flex items-center px-4 py-2">
      &emsp;&emsp;{{ speciesInformation?.content }}
    </div>
    <div class="col-span-1">
      <img
        :src="speciesInformation?.thumbnail?.source"
        class="object-contain max-h-50"
      >
    </div>
  </div>
</template>
<script lang="ts" src="./species-information.ts"></script>
