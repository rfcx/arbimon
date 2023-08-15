<template>
  <el-select
    v-model="selectedSpeciesSlug"
    filterable
    :filter-method="onFilterType"
    class="species-input bg-steel-grey rounded my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
    @change="onResetQuery"
  >
    <el-option
      v-for="species in filteredSpecies"
      :key="'species-selector-' + species.taxonSpeciesId"
      :value="species.taxonSpeciesSlug"
      class="min-h-12 h-12"
      :label="species.scientificName"
    >
      <div class="leading-tight mt-1">
        <div class="italic">
          {{ species.scientificName }}
        </div>
        <div class="text-xs text-insight text-opacity-50">
          {{ species.commonName }}
        </div>
      </div>
    </el-option>
  </el-select>
</template>
<script src="./species-selector.ts" lang="ts"></script>
<style lang="scss" scoped>
:deep(.el-input__inner) {
  font-style: italic;
}

:deep(.select-trigger) {
  width: 300px;
}
</style>
