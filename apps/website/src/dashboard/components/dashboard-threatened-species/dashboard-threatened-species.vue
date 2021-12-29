<template>
  <no-data-panel
    v-if="!hasData"
    class="h-20"
  />
  <div
    v-else
    class="ml-2"
  >
    <div
      v-for="item in species"
      :key="'dashboard-threatened-' + item.speciesId"
      class="flex content-center mb-2"
    >
      <img
        class="h-12 w-12 object-cover mr-2"
        :src="item.imageUrl"
      >
      <router-link
        class="self-center hover:(text-subtle)"
        :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectId: store.selectedProject?.id, speciesSlug: item.speciesSlug } }"
      >
        <div class="flex items-center">
          <el-tag
            v-if="item.extinctionRisk"
            class="border-none text-sm"
            effect="dark"
            size="mini"
            :color="item.extinctionRisk.color"
            :title="item.extinctionRisk.label"
          >
            {{ item.extinctionRisk.code }}
          </el-tag>
          <p class="ml-1 italic">
            {{ item.scientificName }}
          </p>
        </div>
        <p class="text-xs text-subtle">
          {{ item.commonName }}
        </p>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-threatened-species.ts"></script>
