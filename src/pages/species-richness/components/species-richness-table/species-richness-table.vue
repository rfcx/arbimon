<template>
  <div>
    <h2 class="text-white text-xl mb-1.5">
      Top species in each dataset
    </h2>
    <div class="table w-full">
      <div class="table-header-group">
        <div class="table-row">
          <div class="table-cell font-bold border-b">
            Species name
          </div>
          <div class="table-cell font-bold border-b">
            Class
          </div>
          <div class="table-cell font-bold border-b">
            DS1
          </div>
        </div>
      </div>
      <div class="table-row-group">
        <div class="table-row">
          <div class="table-cell">
            Pigion
          </div>
          <div class="table-cell">
            Birds
          </div>
          <div class="table-cell">
            3
          </div>
        </div>
      </div>
    </div>
    <!-- <table class="table table-auto">
      <thead>
        <th>Species name</th>
        <th>Class</th>
        <th>DS1</th>
      </thead>
    </table> -->
  </div>
</template>
<script lang="ts" src="./species-richness-table.ts"></script>
