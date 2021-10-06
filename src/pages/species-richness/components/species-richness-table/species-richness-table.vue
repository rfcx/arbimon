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
            :key="'species-table-header-' + idx"
            class="table-cell font-bold border-b capitalize"
            :class="{ 'text-left': idx < 2 }"
          >
            {{ title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, ridx) in tableData"
          :key="'species-table-row-' + ridx"
          class="table-row"
        >
          <td
            v-for="(column, cidx) in Object.values(row)"
            :key="'species-table-column-' + cidx"
            class="table-cell py-1"
            :class="{ 'text-center': cidx > 1 }"
          >
            {{ column }}
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
