<template>
  <div class="overflow-x-auto">
    <div class="flex flex-row flex-wrap">
      <div
        v-for="(filters, idx) in filters"
        :key="'stream-card' + idx"
        class="flex flex-col justify-center w-48 max-w-48 h-24 mr-4 mt-6 bg-clip-padding mirage-grey border-2 hover:bg-steel-grey cursor-pointer rounded-xl px-4 text-white text-sm"
        @click="showFilterPopup(true, idx)"
      >
        <div class="flex flex-row">
          <div
            class="flex flex-row flex-1"
            :title="filters.displayTitle"
          >
            <i class="icon-pin mr-2" /> <div class="truncate max-w-24">
              {{ filters.displayTitle }}
            </div>
          </div>
          <div
            class="flex flex-col self-end"
            :class="{ 'invisible': isDefaultFilter }"
            @click.stop="removeFilterConfig(idx)"
          >
            <i class="icon-close cursor-pointer" />
          </div>
        </div>
        <div class="flex flex-row items-center mt-2">
          <i class="icon-time mr-2" /> {{ filters.displayDate }}
        </div>
      </div>
      <div
        v-if="showAddButton"
        class="flex flex-col justify-center items-center w-48 max-w-48 h-24 mt-6 bg-clip-padding mirage-grey hover:bg-steel-grey cursor-pointer border-2 border-dashed rounded-xl p-4 text-white text-sm"
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
      @apply="apply"
      @close="showFilterPopup"
    />
  </div>
</template>
<script src="./comparison-list.ts" lang="ts" />
