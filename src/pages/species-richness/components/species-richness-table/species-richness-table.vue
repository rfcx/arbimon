<template>
  <div>
    <h2 class="text-white text-xl mb-1.5">
      Species in each dataset
    </h2>
    <div class="table w-full">
      <div class="table-header-group">
        <div class="table-row">
          <div
            v-for="(title,idx) in tableHeader"
            :key="'species-table-header-' + idx"
            class="table-cell font-bold border-b"
          >
            {{ title }}
          </div>
        </div>
      </div>
      <div class="table-row-group">
        <!-- <div class="table-row">
          <div class="table-cell">
            Pigion
          </div>
          <div class="table-cell">
            Birds
          </div>
          <div class="table-cell">
            3
          </div>
        </div> -->
      </div>
    </div>
    <div
      v-if="hasNoData"
      class="flex justify-center text-secondary mt-2"
    >
      No data
    </div>
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
