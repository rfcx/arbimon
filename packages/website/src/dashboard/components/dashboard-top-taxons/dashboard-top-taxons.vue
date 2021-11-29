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
    <li
      v-for="item in richnessPercentage"
      :key="'dashboard-richness-' + item.taxonClass"
      class="inline-flex"
    >
      <div
        class="rounded-full w-2 h-2 self-center mx-2"
        :style="{ backgroundColor: item.color }"
      /> {{ item.taxonClass }} ({{ displayPercentage(item.percentage) }} %)
    </li>
  </ul>
</template>
<script lang="ts" src="./dashboard-top-taxons.ts"></script>
