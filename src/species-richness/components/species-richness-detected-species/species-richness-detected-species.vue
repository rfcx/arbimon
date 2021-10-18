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
            v-for="row in pageData"
            :key="'species-table-row-' + row.speciesName"
            class="capitalize"
          >
            <td class="p-2">
              <router-link
                :to="{ name: 'activity_patterns', params: { speciesSlug: row.speciesSlug }}"
                class="text-subtle hover:(underline text-white)"
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
                  class="text-subtle m-auto opacity-65"
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
      <div class="flex justify-end items-center mt-4">
        <div>
          <input
            v-model.number="currentPage"
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
<script lang="ts" src="./species-richness-detected-species.ts"></script>
<style lang="scss" scoped>
/* Chrome, Safari, Edge, Opera */
.input-hide-arrows::-webkit-outer-spin-button,
.input-hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-hide-arrows {
  /* Firefox */
  -moz-appearance: textfield;
}
</style>
