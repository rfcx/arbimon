<template>
  <h2 class="text-white text-xl">
    Detected species
  </h2>
  <no-data-panel
    v-if="!hasTableData"
    class="h-32 mt-2"
  />
  <div
    v-else
    class="mt-2"
  >
    <table class="w-full table-fixed">
      <thead class="h-10">
        <tr class="sticky top-0 z-10">
          <th
            v-for="(item, idx) in tableHeader"
            :key="'species-table-header-' + item.title"
            class="font-bold capitalize p-2 bg-mirage-grey select-none"
            :class="{ 'text-left': idx < 2, 'w-66': idx < 1, 'cursor-pointer': item.key }"
            @click="sort(item.key)"
          >
            <div
              class="flex flex-row"
              :class="{ 'justify-center': idx >= 2 }"
            >
              {{ item.title }}
              <div
                v-if="item.key"
                class="ml-2 text-faded"
              >
                <icon-fa-chevron-up
                  class="text-xxs"
                  :class="{'text-white': sortColumn === item.key && sortDirection === 1 }"
                />
                <icon-fa-chevron-down
                  class="text-xxs"
                  :class="{'text-white': sortColumn === item.key && sortDirection === -1 }"
                />
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in pageData"
          :key="'species-table-row-' + row.speciesName"
        >
          <td class="p-2">
            <router-link
              :to="{ name: 'activity_patterns', params: { speciesSlug: getSpeciesSlug(row.speciesName) }}"
              class="text-subtle hover:(underline text-white)"
            >
              <span class="text-white italic">{{ row.speciesName }}</span>
              <icon-fas-caret-right class="inline-block w-3.5 h-3.5 " />
            </router-link>
          </td>
          <td class="p-2">
            {{ row.taxonomyClass }}
          </td>
          <td class="p-2 text-center">
            {{ row.detectionCount }}
          </td>
          <td class="p-2 text-center">
            {{ getThreeDecimalNumber(row.detectionFrequency) }}
          </td>
          <td class="p-2 text-center">
            {{ row.occupiedSites }}
          </td>
          <td class="p-2 text-center">
            {{ getThreeDecimalNumber(row.occupancyNaive) }}
          </td>
        </tr>
        <tr
          v-for="blankIndex in pageSize - pageData.length"
          :key="'blank-row' + blankIndex"
        >
          <td class="p-2">
            <span>&nbsp;</span>
          </td>
        </tr>
        <tr
          class="h-1.5 border-b-1 border-subtle"
        >
          <td :colspan="tableHeader.length" />
        </tr>
      </tbody>
    </table>
    <div class="flex justify-between items-center mt-3">
      <div class="text-subtle px-2">
        Total: {{ tableData.length }} species
      </div>
      <div class="flex justify-end items-center">
        <div>
          <input
            v-model.number="pageIndex"
            type="number"
            min="1"
            :max="maxPage"
            class="text-center text-sm bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
            @keyup.enter="blur"
          >
          of
          <span class="ml-1.5">{{ maxPage }}</span>
        </div>
        <button
          class="btn btn-icon ml-4"
          @click="previousPage()"
        >
          <icon-fas-chevron-left class="w-3 h-3" />
        </button>
        <button
          class="btn btn-icon ml-2"
          @click="nextPage()"
        >
          <icon-fas-chevron-right class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./activity-overview-by-species.ts"></script>
