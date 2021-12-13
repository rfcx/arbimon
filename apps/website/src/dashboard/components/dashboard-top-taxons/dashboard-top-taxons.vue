<template>
  <div class="w-full rounded-2xl bg-steel-grey mb-4 p-4">
    <router-link
      class="flex justify-between"
      :to="{ name: richnessRoutename, params: { projectId } }"
    >
      <div class="font-semibold">
        Richness
      </div>
      <div class="flex">
        <div v-if="hasData">
          {{ totalSpecies }} species
        </div>
        <icon-fas-angle-right class="font-semibold self-center" />
      </div>
    </router-link>
  </div>
  <no-data-panel
    v-if="!hasData"
    class="h-20"
  />
  <div v-else>
    <div class="relative mx-2">
      <div class="absolute w-full h-1 rounded-xl bg-steel-grey-light" />
      <div
        v-for="(item, idx) in richnessPercentage"
        :key="'dashboard-richness-percentage-' + item.taxon"
        class="absolute h-1 rounded-xl"
        :style="{ width: calculateBarWidth(idx) + '%', backgroundColor: item.color , zIndex: richnessPercentage.length - idx }"
      />
    </div>
    <div class="pt-4">
      <ul class="list-none">
        <li
          v-for="item in richnessPercentage"
          :key="'dashboard-richness-class-' + item.taxon"
          class="inline-flex"
        >
          <div
            class="rounded-full w-2 h-2 self-center mx-2"
            :style="{ backgroundColor: item.color }"
          /> {{ item.taxon }} ({{ displayPercentage(item.percentage) }} %)
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-top-taxons.ts"></script>
