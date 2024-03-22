<template>
  <div
    v-if="loading"
    class="loading-shimmer h-32 mt-2"
  />
  <no-data-panel
    v-else-if="!hasTableData"
    class="h-32 mt-2"
  />
  <div
    v-else
    class="mt-2 bg-echo"
  >
    <div class="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-box-gray scrollbar-track-box-util-gray-01">
      <table class="w-full table-fixed">
        <thead class="h-10 border-b-1 border-util-gray-02">
          <tr>
            <th
              v-for="(item, idx) in tableHeader"
              :key="'species-table-header-' + item.title"
              class="font-bold capitalize select-none px-4"
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
                class="flex items-center text-xs"
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
            v-for="(row, idx) in pageData"
            :key="'species-table-row-' + row.scientificName + idx"
          >
            <tr class="border-b-1 border-util-gray-01">
              <td class="py-2 pl-4 sticky left-0 z-10">
                <router-link
                  :to="{ name: ROUTE_NAMES.activityPatterns, params: { speciesSlug: getSpeciesSlug(row.title) }, query: $route.query }"
                  class="text-subtle hover:(underline text-white) flex"
                >
                  <img
                    v-if="row.image"
                    class="h-8 w-8 self-center rounded-full"
                    :src="row.image"
                  >
                  <div
                    v-else
                    class="h-8 w-8 rounded-full bg-util-gray-03"
                  />
                  <div class="ml-2">
                    <span class="text-insight text-base italic">{{ row.title }}</span>
                    <p
                      v-if="row.value"
                      class="text-xs text-util-gray-01"
                    >
                      {{ row.value }}
                    </p>
                    <p
                      v-else
                      class="invisible text-xs text-util-gray-01"
                    >
                      Unknown
                    </p>
                  </div>
                </router-link>
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.total }}
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.confirmed }}
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.rejected }}
              </td>
              <td class="p-2 text-center text-xs text-insight">
                {{ row.uncertain }}
              </td>
            </tr>
          </template>
          <tr
            v-for="blankIndex in pageSize - pageData.length"
            :key="'blank-row-' + blankIndex"
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
    <div class="flex justify-end mt-3">
      <div class="flex justify-end">
        <div class="text-sm">
          <input
            v-model.number="pageIndex"
            type="number"
            min="1"
            :max="maxPage"
            class="text-center bg-transparent border-0 border-b-1 border-b-subtle focus:(ring-subtle border-b-subtle) px-1 py-0.5 mr-1 input-hide-arrows"
            @keyup.enter="blur"
          >
          of
          <span class="ml-1.5">{{ maxPage }}</span>
        </div>
        <button
          class="btn btn-icon ml-4 rounded-md bg-fog border-0"
          @click="previousPage()"
        >
          <icon-fas-chevron-left class="w-3 h-3 text-pitch" />
        </button>
        <button
          class="btn btn-icon ml-2 rounded-md bg-fog border-0"
          @click="nextPage()"
        >
          <icon-fas-chevron-right class="w-3 h-3 text-pitch" />
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./cnn-job-species-detected.ts"></script>
