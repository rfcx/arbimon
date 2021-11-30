<template>
  <div class="w-full rounded-2xl bg-steel-grey my-4 p-4 flex justify-between">
    <div class="font-semibold">
      Highlighted species
    </div>
    <router-link
      class="flex hover:(underline opacity-70)"
      :to="{ name: activityOverview, params: { projectId } }"
    >
      <div>
        Compare
      </div>
      <icon-fas-angle-right class="font-semibold self-center" />
    </router-link>
  </div>
  <div class="flex items-center ml-2">
    <img
      src="../../assets/default-species-image.jpg"
      class="max-h-20 mr-4"
    >
    <div
      class="hover:(underline opacity-70 cursor-pointer)"
    >
      <p class="text-lg">
        Cat
      </p>
      <p>Endangered</p>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-hilighted-species.ts"></script>
