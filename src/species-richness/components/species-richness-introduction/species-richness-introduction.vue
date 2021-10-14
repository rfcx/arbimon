<template>
  <div class="flex flex-row justify-between items-center w-full">
    <page-title-view>
      <template #title>
        Species Richness
      </template>
      <template #subtitle>
        Number of distinct species detected
      </template>
    </page-title-view>
    <div class="relative">
      <on-click-outside
        @trigger="openDropdown(false)"
      >
        <button
          class="btn btn-icon"
          :disabled="!haveData"
          title="No data in selections"
          @click="openDropdown(!isDropdownOpen)"
        >
          <icon-fas-ellipsis-v />
        </button>
        <dropdown-menu v-if="isDropdownOpen">
          <dropdown-item
            class="flex flex-row items-center"
            @click="exportCSVReports()"
          >
            <icon-far-file-archive class="text-sm mr-1" /> Export as CSV
          </dropdown-item>
        </dropdown-menu>
      </on-click-outside>
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
