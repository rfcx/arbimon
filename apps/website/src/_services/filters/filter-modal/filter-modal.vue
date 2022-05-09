<template>
  <modal-popup
    name="buildComparisonModal"
  >
    <h1 class="text-xl text-white pt-4 pb-2 px-4 border-b-1">
      Customize dataset
    </h1>
    <div class="flex flex-row min-h-lg">
      <!-- left menu bar -->
      <div class="border-r-1 min-w-30">
        <div
          v-for="(menu) in menus"
          :key="'menu-' + menu.id"
          class="text-white px-4 py-2 border-b-1"
          :class="{ 'border-l-4 border-l-brand-primary': isCurrentActive(menu.id) }"
          @click="setActiveMenuId(menu.id)"
        >
          {{ menu.name }}
        </div>
      </div>
      <!-- right content -->
      <!-- Site -->
      <div
        v-if="currentActiveMenuId === menus[0].id"
        class="w-full"
      >
        <filter-site
          :initial-site-groups="siteGroups"
          @emit-selected-site-group="onSiteGroupChange"
        />
      </div>

      <!-- Taxon -->
      <div
        v-else-if="currentActiveMenuId === 'taxon'"
        class="w-full"
      >
        <filter-taxon
          :initial-taxon-classes="selectedTaxons"
          @emit-selected-taxons="onTaxonChange"
        />
      </div>

      <!-- Date range -->
      <div
        v-else
        class="p-4 flex"
      >
        <date-range-picker
          :default-start-date="dateStartLocal"
          :default-end-date="dateEndLocal"
          @emit-date-change="onDateChange"
        />
      </div>
    </div>
    <div class="flex justify-end px-4 py-2 border-t-1">
      <button
        class="btn mr-2"
        @click="emitClose"
      >
        Cancel
      </button>
      <button
        class="btn btn-primary"
        @click="emitApply"
      >
        Apply
      </button>
    </div>
  </modal-popup>
</template>
<script src="./filter-modal.ts" lang="ts"></script>
