<template>
  <div class="overflow-x-auto scrollbar-hide">
    <h2 class="text-white">
      Click "Add comparison" below to compare between date ranges {{ canFilterByTaxon ? ', sites , or taxonomies' : 'or sites' }}
    </h2>
    <div class="flex mt-5">
      <div
        v-for="(filter, idx) in filters"
        :key="'site-card' + idx"
        class="w-48 min-w-48 mr-4 cursor-pointer rounded-xl border-white text-white text-sm opacity-100 hover:opacity-90"
        :style="{ 'border': `solid 3px ${getFilterColor(idx)}`, 'background-color': `${getFilterColor(idx)}80` }"
        @click="popupOpen(idx)"
      >
        <!--TODO: 268 Show full information of filter when the user hovers over the comparison box -->
        <!--TODO: 269 Extract comparison item to separate file -->
        <div class="flex px-4 mt-2">
          <div
            class="flex flex-1"
            :title="filter.displayTitle"
          >
            <div class="min-w-4">
              <icon-fa-map-marker />
            </div>
            <div class="truncate max-w-24 ml-2">
              {{ filter.displayTitle }}
            </div>
          </div>
          <div
            :class="{ 'invisible': isDefaultFilter }"
            @click.stop="removeFilterConfig(idx)"
          >
            <icon-fa-close class="cursor-pointer w-3" />
          </div>
        </div>
        <div
          class="flex items-center my-2 px-4"
        >
          <div class="min-w-4">
            <icon-fas-clock />
          </div>
          <div class="ml-2">
            {{ filter.displayDate }}
          </div>
        </div>
        <div
          v-if="canFilterByTaxon"
          class="flex items-center py-2 px-4"
          :style="{ 'border-top': `solid 1px ${getFilterColor(idx)}`}"
        >
          <div class="min-w-4">
            <icon-fas-filter />
          </div>
          <div class="ml-2 first-letter:capitalize">
            {{ getOptionalFilterText(idx) }}
          </div>
        </div>
      </div>
      <div
        v-if="showAddButton"
        class="flex justify-center items-center w-48 min-w-32 px-4 cursor-pointer rounded-xl bg-mirage-grey text-white border-2 border-dashed hover:bg-steel-grey"
        @click="addFilterConfig"
      >
        <div class="uppercase">
          Add comparison
        </div>
      </div>
    </div>
    <!-- Filter -->
    <comparison-filter-modal-component
      v-if="isFilterOpen"
      :initial-values="modalFilter"
      :can-filter-by-taxon="canFilterByTaxon"
      @emit-apply="apply"
      @emit-close="popupClose"
    />
  </div>
</template>
<script src="./comparison-list.ts" lang="ts"></script>
