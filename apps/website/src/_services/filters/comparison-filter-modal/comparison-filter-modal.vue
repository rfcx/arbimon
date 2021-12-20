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
          <el-select
            v-model="selectedSite"
            value-key="label"
            filterable
            fit-input-width
            placeholder="Type to filter sites"
            no-data-text="No matching sites"
            class="search-select m-4"
            :filter-method="onFilterType"
            @change="onSiteSelected"
          >
            <el-option
              v-if="optionAllMatchingFilter"
              :key="'site-match-' + optionAllMatchingFilter.label"
              :label="'All sites starting with ' + inputFilter.toLocaleUpperCase()"
              :value="optionAllMatchingFilter"
            />
            <el-option
              v-for="item in filtered"
              :key="'site-list-' + item.siteId"
              :label="item.name"
              :value="{ label: item.name, value: [item] }"
            />
          </el-select>
          <div class="ml-2">
            <el-tag
              v-for="site in selectedSites"
              :key="'site-tag-'+ site.label"
              class="ml-2 mb-2 select-none"
              closable
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
      <div
        v-else
        class="p-4 flex"
      >
        <div>
          <label
            class="text-white block"
            for="start"
          >
            Start
          </label>
          <input
            v-model="startDate"
            type="date"
            :max="today"
            class="bg-white text-black rounded-lg mr-2"
          >
        </div>
        <div>
          <label
            class="text-white block"
            for="end"
          >
            End
          </label>
          <input
            v-model="endDate"
            type="date"
            :max="today"
            class="bg-white text-black rounded-lg mr-2"
          >
        </div>
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

@media (max-width: 700px) {
  .search-select .select-trigger {
    width: 300px;
  }
}
</style>
