<template>
  <no-data-container-view
    v-if="!speciesInformation || isLoading"
    class="h-32"
  />
  <div
    v-else
    class="grid grid-cols-4"
  >
    <div class="col-span-3 self-center px-4 py-2">
      <div>
        &emsp;&emsp;{{ speciesInformation?.content }}
        (
        <b class="opacity-80">Source: &nbsp;</b>
        <a
          :href="redirectToWiki()"
          target="_blank"
          class="opacity-80 hover:(underline opacity-70)"
        >
          Wikipedia
        </a>
        )
      </div>
    </div>
    <div class="col-span-1 place-self-center">
      <img
        :src="speciesInformation?.thumbnail?.source"
        class="object-contain max-h-50"
      >
    </div>
  </div>
</template>
<script lang="ts" src="./species-information.ts"></script>
