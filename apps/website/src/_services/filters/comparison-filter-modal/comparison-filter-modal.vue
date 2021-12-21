<template>
  <modal-popup
    name="buildComparisonModal"
  >
    <h1 class="text-xl text-white pt-4 pb-2 px-4 border-b-1">
      Build comparison
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
      <!-- site -->
      <div
        v-if="currentActiveMenuId === menus[0].id"
        class="w-full"
      >
        <div class="w-full p-4">
          <!-- TODO: 50 implement search logic -->
          <input
            type="text"
            placeholder="Search"
            class="rounded-lg w-full bg-gray-200 focus:outline-none focus:bg-white focus:border-brand-primary hidden"
          >
        </div>
        <div class="max-h-md overflow-auto">
          <label
            class="px-4 pb-2 align-middle list-item"
          >
            <input
              type="radio"
              class="rounded"
              :checked="isSelectedAllSites"
              @click="selectAllSites()"
            >
            <span class="text-white ml-2">All sites in the project</span>
          </label>
          <h2 class="text-primary px-4 pt-2 pb-4 border-t-1 border-grey">
            Filter results from some sites only
          </h2>

          <el-select
            v-model="selectedSites"
            value-key="siteId"
            multiple
            filterable
            :filter-method="onFilterType"
            fit-input-width
            reserve-keyword
            placeholder=" "
            class="search-select mx-2 mb-2"
          >
            <el-option
              v-for="(item) in filterInputSites"
              :key="'site-list-' + item.site.siteId"
              :label="item.site.name"
              :value="item.site"
            />
          </el-select>
          <el-tag
            v-for="site in selectedSites"
            :key="'site-tag-'+ site.siteId"
            class="ml-2 mb-2"
            closable
            effect="dark"
            @close="onRemoveSiteTags(site)"
          >
            {{ site.name }}
          </el-tag>
        </div>
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
<script src="./comparison-filter-modal.ts" lang="ts"></script>
<style lang="scss">
.search-select {
  .select-trigger{
    width: 500px;
    background-color: #141525;
    & .el-input * > .el-icon.el-select__caret {
      display: flex;
    }
  }
  span.el-tag {
    display: none;
  }
  * > input {
    background-color: #141525;
    border-radius: 0.25rem;
  }
  & * > .el-select__input {
    margin: 0 0 0 2px;
    &:focus {
      box-shadow: none;
    }
  }
}
</style>
