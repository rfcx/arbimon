<template>
  <el-select
    v-model="selectedSpeciesSlug"
    filterable
    :filter-method="onFilterType"
    :loading="loadingSpecies"
    class="bg-steel-grey rounded p-2 my-6 focus:(border-box-grey ring-0 outline-none) min-w-64"
  >
    <el-option
      v-for="species in filteredSpecies"
      :key="'species-selector-' + species.speciesId"
      :value="species.speciesSlug"
      class="italic"
      :label="species.scientificName"
    />
  </el-select>
</template>
<script src="./species-selector.ts" lang="ts"></script>
<style lang="scss">
.el-input__inner {
  font-style: italic;
}
.el-input [type='text']{
  background-color: #141525;
}
</style>
