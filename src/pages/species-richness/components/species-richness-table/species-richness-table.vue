<template>
  <div>
    <h2 class="text-white text-xl">
      Top species in each dataset
    </h2>
    <div class="table border-2 border-white border-collapse">
      <div class="table-header-group">
        <div class="table-row">
          <div class="table-cell border-1 border-white">
            Species name
          </div>
          <div class="table-cell border-1 border-white">
            Class
          </div>
          <div class="table-cell border-1 border-white">
            DS1
          </div>
        </div>
      </div>
      <div class="table-row-group">
        <div class="table-row">
          <div class="table-cell border-1 border-white">
            Pigion
          </div>
          <div class="table-cell border-1 border-white">
            Birds
          </div>
          <div class="table-cell border-1 border-white">
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
