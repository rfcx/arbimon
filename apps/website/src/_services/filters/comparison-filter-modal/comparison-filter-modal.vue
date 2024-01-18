<template>
  <modal-popup
    name="buildComparisonModal"
  >
    <h1 class="text-xl text-insight p-4 border-b-1 border-util-gray-03">
      Customize dataset
    </h1>
    <div class="flex flex-row min-h-lg">
      <!-- left menu bar -->
      <div class="border-r-1 border-util-gray-03 min-w-30">
        <div
          v-for="(menu) in menus"
          :key="'menu-' + menu.id"
          class="text-white px-4 py-2 border-b-1 border-util-gray-03"
          :class="{ 'border-l-4 border-l-frequency': isCurrentActive(menu.id) }"
          @click="setActiveMenuId(menu.id)"
        >
          {{ menu.name }}
        </div>
      </div>
      <!-- right content -->
      <!-- site -->
      <div
        v-if="currentActiveMenuId === menus[0].id"
        class="w-full"
      >
        <filter-site
          :initial-site-groups="selectedSiteGroups"
          @emit-selected-sites="updateSelectedSites"
        />
      </div>

      <!-- Taxon -->
      <div
        v-else-if="currentActiveMenuId === 'taxon'"
        class="w-full"
      >
        <filter-taxon
          :initial-taxon-classes="selectedTaxons"
          @emit-selected-taxons="updateSelectedTaxons"
        />
      </div>

      <!-- Date range -->
      <div
        v-else
        class="p-4 flex"
      >
        <date-range-picker
          :default-start-date="startDate"
          :default-end-date="endDate"
          @emit-date-change="onDateChange"
        />
      </div>
    </div>
    <div class="flex justify-end px-4 py-2 border-t-1 border-util-gray-03">
      <button
        class="btn btn-secondary mr-2"
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
<script src="./comparison-filter-modal.ts" lang="ts"></script>
