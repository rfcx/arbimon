<template>
  <div v-if="hasData">
    <div
      v-for="ratingAndSpecies in speciesByRating"
      :key="ratingAndSpecies[0]"
      class="ml-2 not-first:mt-4"
    >
      <el-tag
        class="threatened-tag border-none text-xs"
        effect="dark"
        size="mini"
        :color="ratingAndSpecies[1][0].riskRating.color"
        :title="ratingAndSpecies[1][0].riskRating.label"
      >
        {{ ratingAndSpecies[1][0].riskRating.code }}
      </el-tag>
      <span class="ml-1.5 text-sm">{{ ratingAndSpecies[0] }} ({{ ratingAndSpecies[1].length }})</span>
      <div
        class="grid gap-0.75 mt-2.5"
        style="grid-template-columns: repeat(auto-fill, 56px);"
      >
        <div
          v-for="item in ratingAndSpecies[1]"
          :key="'dashboard-threatened-' + item.slug"
        >
          <router-link
            class="self-center hover:(text-subtle)"
            :to="{ name: ROUTE_NAMES.activityPatterns, params: { projectSlug: store.selectedProject?.slug, speciesSlug: item.slug } }"
          >
            <img
              class="min-h-14 h-14 min-w-14 w-14 object-cover mr-2"
              :src="item.photoUrl"
              :title="item.scientificName"
              :alt="item.scientificName"
            >
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./dashboard-threatened-species.ts"></script>
<style lang="scss">
.threatened-tag {
  height: 1rem;
}
</style>
