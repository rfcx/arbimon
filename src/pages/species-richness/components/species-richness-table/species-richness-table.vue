<template>
  <div>
    <h2 class="text-white text-xl">
      Detected Species
    </h2>
    <no-data-container-view
      v-if="!hasTableData"
      class="h-32 mt-2"
    />
    <div
      v-else
      class="mt-2 max-h-100 overflow-y-auto"
    >
      <table class="w-full">
        <thead class="h-10">
          <tr class="sticky top-0 z-10">
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
              <router-link
                :to="{ name: 'activity_patterns', params: { speciesId: row.speciesId }}"
                class="text-secondary hover:(underline text-white)"
              >
                <span class="text-white">{{ row.speciesName }}</span>
                <icon-fas-caret-right class="inline-block w-3.5 h-3.5 " />
              </router-link>
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
                  class="text-secondary m-auto opacity-65"
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
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
