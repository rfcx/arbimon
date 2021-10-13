<template>
  <div class="overflow-x-auto">
    <div class="flex flex-row flex-wrap">
      <div
        v-for="(filter, idx) in filters"
        :key="'site-card' + idx"
        class="flex flex-col justify-center w-48 max-w-48 h-24 mr-4 mt-6 px-4 cursor-pointer rounded-xl border-white text-white text-sm opacity-100 hover:opacity-90"
        :style="{ 'border': `solid 3px ${getFilterColor(idx)}`, 'background-color': `${getFilterColor(idx)}80` }"
        @click="popupOpen(idx)"
      >
        <div class="flex flex-row">
          <div
            class="flex flex-row flex-1"
            :title="filter.displayTitle"
          >
            <icon-fa-map-marker class="mr-2" /> <div class="truncate max-w-24">
              {{ filter.displayTitle }}
            </div>
          </div>
          <div
            class="flex flex-col self-end"
            :class="{ 'invisible': isDefaultFilter }"
            @click.stop="removeFilterConfig(idx)"
          >
            <icon-fa-close class="cursor-pointer" />
          </div>
        </div>
        <div class="flex flex-row items-center mt-2">
          <icon-fas-clock class="mr-2" /> {{ filter.displayDate }}
        </div>
      </div>
      <div
        v-if="showAddButton"
        class="flex flex-col justify-center items-center w-48 max-w-48 h-24 mt-6 px-4 cursor-pointer rounded-xl bg-mirage-grey hover:bg-steel-grey text-white border-2 border-dashed text-sm"
        @click="addFilterConfig"
      >
        <div class="uppercase">
          + Add
        </div>
      </div>
    </div>
    <comparison-filter-modal-component
      v-if="isFilterOpen"
      :default-filter="currentSelectedFilter"
      @emitApply="apply"
      @emitClose="popupClose"
    />
  </div>
</template>
<script src="./comparison-list.ts" lang="ts"></script>
