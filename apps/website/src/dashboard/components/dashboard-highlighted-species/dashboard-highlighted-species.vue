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
      :key="'dashboard-highlighted-' + item.slug"
      class="flex content-center mb-2"
    >
      <img
        class="min-h-14 h-14 min-w-14 w-14 object-cover mr-2"
        :src="item.photoUrl"
      >
      <router-link
        class="mt-0.5 self-center hover:(text-subtle)"
        :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug, speciesSlug: item.slug } }"
      >
        <div class="flex items-center">
          <el-tag
            class="species-highlights border-none text-xs"
            effect="dark"
            size="mini"
            :color="item.riskRating.color"
            :title="item.riskRating.label"
          >
            {{ item.riskRating.code }}
          </el-tag>
          <p class="ml-1 italic">
            {{ item.scientificName }}
          </p>
        </div>
        <p class="text-xs text-subtle capitalize">
          {{ item.commonName || 'unknown' }}
        </p>
      </router-link>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-highlighted-species.ts"></script>
<style lang="scss">
.species-highlights {
  height: 1rem;
}
</style>
