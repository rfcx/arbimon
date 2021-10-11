<template>
  <div class="mt-5">
    <h2 class="text-white text-xl mb-1.5">
      Detected Species
    </h2>
    <div
      v-if="hasTableData"
      class="mt-2 max-h-100 overflow-y-auto"
    >
      <table class="w-full">
        <thead class="h-10">
          <tr class="sticky top-0">
            <th
              v-for="(item, idx) in tableHeader"
              :key="'species-table-header-' + item.title"
              class="font-bold capitalize p-2 bg-mirage-grey"
              :class="{ 'text-left': idx < 2 }"
              :style="{ 'box-shadow': `inset 0 -3px 0 ${item.color}` }"
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
            <template
              v-for="(dataset, idx) in datasetCount"
              :key="'species-table-column-' + dataset"
            >
              <td
                v-if="hasMoreThanOneDataset"
                class="p-2 text-white"
              >
                <icon-fa-check
                  v-if="row.data[idx]"
                  class="m-auto"
                  :style="{ color: colors[idx] }"
                />
                <icon-fa-close
                  v-else
                  class="text-secondary m-auto"
                />
              </td>
            </template>
            <td
              v-if="hasMoreThanOneDataset"
              class="p-2 text-center"
            >
              {{ row.total }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-else
      class="flex justify-center items-center mt-2 h-12 text-secondary border-2 border-secondary"
    >
      No data
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
