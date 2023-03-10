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
          :class="{ 'border-l-4 border-l-primary': isCurrentActive(menu.id) }"
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
        <div class="w-full px-4 pt-3">
          <input
            type="text"
            placeholder="Search"
            class="rounded-lg w-full bg-gray-200 focus:outline-none focus:bg-white focus:border-primary hidden"
          >
        </div>
        <div class="max-h-md">
          <label
            class="select-all-items pl-4 pb-2 align-middle list-item list-none"
          >
            <input
              type="radio"
              class="rounded"
              :checked="isSelectedAllSites"
              @click="selectAllSites()"
            >
            <span class="text-white ml-2">All sites in the project</span>
          </label>

          <el-select
            v-model="selectedSiteGroups"
            value-key="label"
            multiple
            filterable
            popper-class="selector-sites"
            name="input-site"
            fit-input-width
            reserve-keyword
            placeholder="Type to filter sites"
            no-data-text="No matching sites"
            class="search-select ml-4 mt-2"
            :filter-method="onFilterType"
            @blur="onSetSelectorPlaceHolder"
            @input="onRemoveSelectorPlaceHolder"
            @focus="onRemoveSelectorPlaceHolder"
          >
            <el-option
              v-if="optionAllMatchingFilter"
              :key="'site-match-' + optionAllMatchingFilter.label"
              :label="'All sites starting with ' + inputFilter.toLocaleUpperCase()"
              :value="optionAllMatchingFilter"
            />
            <el-option
              v-for="item in filtered"
              :key="'site-list-' + item.id"
              :label="item.name"
              :value="{ label: item.name, value: [item] }"
            />
          </el-select>
          <div class="ml-2 mt-3">
            <el-tag
              v-for="site in selectedSiteGroups"
              :key="'site-tag-'+ site.label"
              class="ml-2 mb-2 select-none"
              closable
              type="info"
              effect="dark"
              @close="onRemoveSiteTags(site)"
            >
              {{ site.label }}
            </el-tag>
          </div>
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
  .select-trigger {
    width: 32.5rem;
    background-color: #141525;
    margin-right: 1rem;
    border-radius: 0.25rem;

    & .el-input * > .el-icon.el-select__caret {
      display: flex;
    }
  }

  span.el-tag {
    display: none;
  }

  * > input {
    background-color: transparent;
    border-radius: 0.25rem;
  }

  & * > .el-select__input {
    margin: 0 0 0 2px;

    &:focus {
      box-shadow: none;
    }
  }
}
.selector-sites {
  background-color:hsl(236, 25%, 15%);
  border: 1px solid #45485D;
  & .el-popper__arrow {
    display: none;
  }
  & .el-select-dropdown__item {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid var(--el-border-color-base);
    &:hover {
      background-color: var(--el-border-color-base);
    }
    &:last-child {
      border-bottom: none;
    }
  }
}
.el-scrollbar__view.el-select-dropdown__list {
  padding: 0;
}

@media (max-width: 700px) {
  .search-select .select-trigger {
    width: 11.25rem;
    margin-right: 1rem;
  }
}
</style>
