<template>
  <section-title title="Species detected" />
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
                'w-20': idx === 1,
                'w-36': idx > 1,
                'sticky left-0': idx === 0,
                'cursor-pointer': item.key
              }"
              @click="sort(item.key)"
            >
              <div
                class="flex items-center"
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
          <template
            v-for="(row, idx) in formattedDatasets"
            :key="'species-table-row-' + row.scientificName + idx"
          >
            <tr>
              <td class="pt-2 px-1 sticky left-0 bg-mirage-grey z-10">
                <router-link
                  :to="{ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug: getSpeciesSlug(row.scientificName) } }"
                  class="text-subtle hover:(underline text-white)"
                >
                  <span class="text-white italic">{{ row.scientificName }}</span>
                  <icon-fas-caret-right class="inline-block w-3.5 h-3.5 " />
                  <p
                    v-if="row.commonName"
                    class="text-xs"
                  >
                    {{ row.commonName }}
                  </p>
                  <p
                    v-else
                    class="invisible text-xs"
                  >
                    Unknown
                  </p>
                </router-link>
              </td>
            </tr>
            <tr
              v-for="speciesData in row.details"
              :key="'species-details-row-' + row.scientificName + speciesData.datasetIdx"
            >
              <td class="px-1 sticky left-0 bg-mirage-grey z-10">
                <div class="flex items-center">
                  <div
                    class="rounded-full w-1.5 h-1.5"
                    :style="`background-color:${datasets[speciesData.datasetIdx].color}`"
                  />
                  <div class="ml-2">
                    Dataset {{ speciesData.datasetIdx + 1 }}
                  </div>
                </div>
              </td>
              <td>
                {{ row.taxon }}
              </td>
              <td class="p-2 text-center">
                {{ getFormattedNumber(speciesData.detectionCount) }}
              </td>
              <td class="p-2 text-center">
                {{ getThreeDecimalNumber(speciesData.detectionFrequency) }}
              </td>
              <td class="p-2 text-center">
                {{ getFormattedNumber(speciesData.occupiedSites) }}
              </td>
              <td class="p-2 text-center">
                {{ getThreeDecimalNumber(speciesData.occupancyNaive) }}
              </td>
            </tr>
          </template>
          <!-- <tr
            v-for="(row) in pageData"
            :key="'species-table-row-' + row.scientificName + row.datasetIdx"
          >
            <td class="pt-2 px-1 sticky left-0 bg-mirage-grey z-10">
              <div class="flex items-center">
                <div
                  v-if="tableData.length > 1"
                  class="rounded-full w-1.5 h-1.5"
                  :style="`background-color:${row.color}`"
                />
                <div :class="{'ml-2': tableData.length > 1}">
                  <router-link
                    :to="{ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug: getSpeciesSlug(row.scientificName) } }"
                    class="text-subtle hover:(underline text-white)"
                  >
                    <span class="text-white italic">{{ row.scientificName }}</span>
                    <icon-fas-caret-right class="inline-block w-3.5 h-3.5 " />
                    <p
                      v-if="row.commonName"
                      class="text-xs"
                    >
                      {{ row.commonName }}
                    </p>
                    <p
                      v-else
                      class="invisible text-xs"
                    >
                      Unknown
                    </p>
                  </router-link>
                </div>
              </div>
            </td>
            <td class="p-2">
              {{ row.taxon }}
            </td>
            <td class="p-2 text-center">
              {{ getFormattedNumber(row.detectionCount) }}
            </td>
            <td class="p-2 text-center">
              {{ getThreeDecimalNumber(row.detectionFrequency) }}
            </td>
            <td class="p-2 text-center">
              {{ getFormattedNumber(row.occupiedSites) }}
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
            class="h-2 border-b-1 border-subtle"
          >
            <td :colspan="tableHeader.length" />
          </tr> -->
        </tbody>
      </table>
    </div>
    <div class="flex justify-between items-center mt-3">
      <div class="text-subtle px-2">
        Total: {{ totalSpecies }} species
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
