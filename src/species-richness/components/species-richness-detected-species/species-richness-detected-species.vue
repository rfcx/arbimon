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
      class="mt-2"
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
            v-for="row in page"
            :key="'species-table-row-' + row.speciesName"
            class="capitalize"
          >
            <td class="p-2">
              <router-link
                :to="{ name: 'activity_patterns', params: { speciesSlug: row.speciesSlug }}"
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
    <div class="flex justify-end items-center mt-4">
      <div class="mr-2 py-2 px-4 text-primary rounded-lg shadow-md bg-box-grey">
        {{ currentPage }} of {{ dataLength }}
      </div>
      <button
        class="btn btn-icon mr-2"
        :disabled="pageIndex === 0"
        @click="previousPage()"
      >
        <icon-fas-less-than />
      </button>
      <button
        class="btn btn-icon"
        :disabled="pageIndex === maxPage || maxPage === -1"
        @click="nextPage()"
      >
        <icon-fas-greater-than />
      </button>
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-detected-species.ts"></script>
