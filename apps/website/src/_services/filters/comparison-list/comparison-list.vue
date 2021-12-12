<template>
  <div class="overflow-x-auto">
    <div class="flex flex-row flex-wrap">
      <div
        v-for="(filter, idx) in filters"
        :key="'site-card' + idx"
        class="flex flex-col justify-top w-48 max-w-52 mr-4 mt-2 cursor-pointer rounded-xl border-white text-white text-sm opacity-100 hover:opacity-90"
        :style="{ 'border': `solid 3px ${getFilterColor(idx)}`, 'background-color': `${getFilterColor(idx)}80` }"
        @click="popupOpen(idx)"
      >
        <!--TODO: 268 Show full information of filter when the user hovers over the comparison box -->
        <!--TODO: 269 Extract comparison item to separate file -->
        <div class="flex flex-row px-4 mt-2">
          <div
            class="flex flex-row flex-1"
            :title="filter.displayTitle"
          >
            <icon-fa-map-marker class="mr-2" /> <div class="truncate max-w-24">
              {{ filter.displayTitle }}
            </div>
          </div>
          <div
            class="flex flex-col self-start"
            :class="{ 'invisible': isDefaultFilter }"
            @click.stop="removeFilterConfig(idx)"
          >
            <icon-fa-close class="cursor-pointer w-3" />
          </div>
        </div>
        <div
          class="flex flex-row items-center mt-2 px-4"
          :class="{'mb-2': filter.otherFilters.length === 0}"
        >
          <icon-fas-clock class="mr-2" /> {{ filter.displayDate }}
        </div>
        <div
          v-if="filter.otherFilters.length > 0"
          class="flex flex-row items-center mt-2 py-2 px-4"
          :style="{ 'border-top': `solid 1px ${getFilterColor(idx)}`}"
        >
          <icon-fas-filter class="mr-2" />
          <span class="first-letter:capitalize">{{ getOptionalFilterText(idx) }}</span>
        </div>
      </div>
      <div
        v-if="showAddButton"
        class="flex flex-col justify-center items-center w-48 max-w-48 min-w-20 px-4 mt-2 cursor-pointer rounded-xl bg-mirage-grey hover:bg-steel-grey text-white border-2 border-dashed text-sm"
        @click="addFilterConfig"
      >
        <div class="uppercase">
          + Add
        </div>
      </div>
    </div>
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
