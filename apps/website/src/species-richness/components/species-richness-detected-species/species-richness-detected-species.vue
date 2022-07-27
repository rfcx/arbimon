<template>
  <div>
    <section-title
      title="Species detected"
      :note="hasTableData && isLocationRedacted ? '* Some species are protected.' : ''"
    />
    <no-data-panel
      v-if="!hasTableData"
      class="h-32 mt-2"
    />
    <div
      v-else
      class="mt-2"
    >
      <div class="w-full overflow-x-auto">
        <table class="w-full table-fixed">
          <thead class="h-10">
            <tr>
              <th
                v-for="(item, idx) in tableHeader"
                :key="'species-table-header-' + item.title"
                class="font-bold capitalize pt-2 px-1 bg-mirage-grey select-none"
                :class="{
                  'text-left': idx < 2,
                  'w-52 lg:w-66': idx < 1,
                  'w-20': tableHeader.length > 2 && idx >= 1,
                  'sticky left-0': idx === 0,
                  'sticky left-52 lg:left-66': idx === 1,
                  'cursor-pointer': item.key
                }"
                :style="{ 'box-shadow': `inset 0 -3px 0 ${item.color}` }"
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
              :key="'species-table-row-' + row.scientificName"
            >
              <td class="pt-2 px-1 sticky left-0 bg-mirage-grey z-10">
                <router-link
                  :to="{ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug: row.taxonSpeciesSlug }}"
                  class="text-subtle hover:(underline text-white)"
                >
                  <span class="text-white italic">{{ row.scientificName }}</span>
                  <icon-fas-caret-right class="inline-block w-3.5 h-3.5" />
                  <p
                    v-if="row.commonName"
                    class="text-xs"
                  >
                    {{ row.commonName }}
                  </p>
                  <p
                    v-else
                    class="invisible"
                  >
                    Unknown
                  </p>
                </router-link>
              </td>
              <td class="p-2 sticky left-52 lg:left-66 bg-mirage-grey z-10">
                {{ row.taxonClassName }}
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
            <tr
              v-for="blankIndex in pageSize - pageData.length"
              :key="'blank-row' + blankIndex"
            >
              <td class="p-2">
                <span>&nbsp;</span>
              </td>
            </tr>
            <tr
              class="h-2 border-b-1 border-subtle"
            >
              <td :colspan="tableHeader.length" />
            </tr>
          </tbody>
        </table>
      </div>
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
