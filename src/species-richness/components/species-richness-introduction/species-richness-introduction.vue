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
        <ul
          v-if="isDropdownOpen"
          class="absolute top-10 right-0 min-w-40 border-t-box-grey border-t-1 bg-box-grey rounded-md text-primary transition-all"
        >
          <li
            class="p-4 hover:(bg-box-grey-dark cursor-pointer)"
            @click="exportCSVReports()"
          >
            Export as CSV
          </li>
        </ul>
      </on-click-outside>
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-introduction.ts"></script>
