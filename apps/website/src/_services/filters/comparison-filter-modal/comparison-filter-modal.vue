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
