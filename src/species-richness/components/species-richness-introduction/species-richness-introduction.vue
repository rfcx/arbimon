<template>
  <div class="flex flex-row justify-between items-center w-full">
    <page-title-view
      page-title="Species Richness"
      page-subtitle="Number of distinct species detected"
    />
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
          <dropdown-menu-item
            class="flex flex-row items-center"
            @click="exportCSVReports()"
          >
            <icon-far-file-archive class="text-sm mr-1" /> Export as CSV
          </dropdown-menu-item>
        </dropdown-menu>
      </on-click-outside>
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
