<template>
  <div class="mt-5">
    <h2 class="text-white text-xl mb-1.5">
      Species in each dataset
    </h2>
    <div class="table w-full">
      <div class="table-header-group">
        <div class="table-row">
          <div
            v-for="(title, idx) in tableHeader"
            :key="'species-table-header-' + idx"
            class="table-cell font-bold border-b"
            :class="{ 'text-center': idx !== 0 }"
          >
            <span class="capitalize">{{ title }}</span>
          </div>
        </div>
      </div>
      <div class="table-row-group">
        <div
          v-for="(row, ridx) in datasets"
          :key="'species-table-row-' + ridx"
          class="table-row"
        >
          <div
            v-for="(column, cidx) in Object.values(row)"
            :key="'species-table-column-' + cidx"
            class="table-cell py-1"
            :class="{ 'text-center': cidx !== 0 }"
          >
            <span class="capitalize">{{ column }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="!hasData"
    class="flex justify-center text-secondary mt-2"
  >
    No data
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
