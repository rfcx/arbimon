<template>
  <div class="mt-5">
    <h2 class="text-white text-xl mb-1.5">
      Detected Species
    </h2>
    <table class="w-full">
      <thead>
        <tr>
          <th
            v-for="(title, idx) in tableHeader"
            :key="'species-table-header-' + title"
            class="table-cell font-bold border-b capitalize"
            :class="{ 'text-left': idx < 2 }"
          >
            {{ title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in tableData"
          :key="'species-table-row-' + row.speciesName"
          class="table-row"
        >
          <td>{{ row.speciesName }}</td>
          <td>{{ row.className }}</td>
          <td
            v-for="dataset in datasetCount"
            :key="'species-table-column-' + dataset"
            class="table-cell py-1 text-center"
          >
            <!-- v-for is 1-based -->
            {{ row.data[dataset - 1] ? 1 : 0 }}
          </td>
          <td class="text-center">
            {{ row.data.filter(p => p).length }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div
    v-if="!hasTableData"
    class="flex justify-center items-center mt-2 h-8 text-secondary"
  >
    No data
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
