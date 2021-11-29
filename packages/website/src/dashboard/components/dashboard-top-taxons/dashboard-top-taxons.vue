<template>
  <div class="w-full rounded-2xl bg-steel-grey p-4 flex justify-between">
    <div class="font-semibold">
      Richness
    </div>
    <router-link
      class="flex hover:(underline)"
      :to="{ name: richnessRoutename, params: { projectId } }"
    >
      <div>
        {{ totalSpecies }} species
      </div>
      <icon-fas-angle-right class="font-semibold self-center" />
    </router-link>
  </div>
  <ul class="mt-2 list-none">
    <li class="inline-flex">
      <div class="bg-fuchsia-400 rounded-full w-2 h-2 self-center mx-2" /> bird
    </li>
    <li class="inline-flex">
      <div class="bg-fuchsia-400 rounded-full w-2 h-2 self-center mx-2" /> bird
    </li>
    <li class="inline-flex">
      <div class="bg-fuchsia-400 rounded-full w-2 h-2 self-center mx-2" /> bird
    </li>
    <li class="inline-flex">
      <div class="bg-fuchsia-400 rounded-full w-2 h-2 self-center mx-2" /> bird
    </li>
    <li class="inline-flex">
      <div class="bg-fuchsia-400 rounded-full w-2 h-2 self-center mx-2" /> bird
    </li>
    <li class="inline-flex">
      <div class="bg-fuchsia-400 rounded-full w-2 h-2 self-center mx-2" /> bird
    </li>
  </ul>
</template>
<script lang="ts" src="./dashboard-top-taxons.ts"></script>
