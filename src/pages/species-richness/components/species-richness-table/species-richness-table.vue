<template>
  <div class="mt-5">
    <h2 class="text-white text-xl mb-1.5">
      Detected Species
    </h2>
    <div class="mt-2 max-h-100 overflow-y-auto">
      <table class="w-full">
        <thead class="h-10">
          <tr class="sticky top-0">
            <th
              v-for="(item, idx) in tableHeader"
              :key="'species-table-header-' + item.title"
              class="font-bold capitalize p-2"
              :class="{ 'text-left': idx < 2, 'text-mirage-grey': idx > 1 && idx < tableHeader.length - 1 }"
              :style="{ backgroundColor: item.color }"
            >
              {{ item.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in tableData"
            :key="'species-table-row-' + row.speciesName"
            class="capitalize"
          >
            <td class="p-2">
              {{ row.speciesName }}
            </td>
            <td class="p-2">
              {{ row.className }}
            </td>
            <td
              v-for="(dataset, idx ) in datasetCount"
              :key="'species-table-column-' + dataset"
              class="p-2 text-center text-mirage-grey"
              :style="{ backgroundColor: colors[idx] + 'f0' }"
            >
              <!-- v-for is 1-based -->
              {{ row.data[dataset - 1] ? 1 : 0 }}
            </td>
            <td class="p-2 text-center">
              {{ row.total }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div
    v-if="!hasTableData"
    class="flex justify-center items-center mt-2 h-8 text-secondary"
  >
    No data
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
