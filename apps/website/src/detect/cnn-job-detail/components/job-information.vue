<template>
  <div class="job-information-wrapper border-1 border-box-grey rounded-md">
    <div class="grid grid-cols-4 px-6 py-4">
      <div>
        <span class="text-subtle ">Model</span>
        <h2 class="text-lg">
          Squirrel v1
        </h2>
      </div>
      <div>
        <span class="text-subtle">Input</span>
        <div
          id="cnn-job-information-input"
          class="grid grid-rows-3 gap-y-1"
        >
          <icon-fa-map-marker class="block m-auto" />
          <h2 class="text-lg">
            All sites (650 sites)
          </h2>
          <icon-fa-calendar class="block m-auto" />
          <h2 class="text-lg">
            2022/02/20 - 2022/02/21
          </h2>
          <icon-fas-clock class="block m-auto" />
          <h2 class="text-lg">
            Diurnal
          </h2>
        </div>
      </div>
      <div>
        <span class="text-subtle">Status</span>
        <div
          id="cnn-job-information-status"
          class="grid grid-rows-3"
        >
          <div class="my-auto w-6">
            <jobInformationStatus :variant="0" />
          </div>
          <h2 class="text-lg">
            Queued
          </h2>
          <el-progress
            class="col-span-2"
            :stroke-width="6"
            :precentage="50"
          />
          <div class="flex flex-row col-span-2">
            <icon-fa-calendar class="block mr-2" />
            <h3 class="text-md text-subtle">
              Jun 29, 2022 13:24 - Tomaz
            </h3>
          </div>
        </div>
      </div>
      <div>
        <span class="text-subtle">Validation Status</span>
        <h2 class="text-lg">
          1/1,413
        </h2>
        <div class="flex flex-row mt-2">
          <icon-fa-calendar class="block mr-2" />
          <h3 class="text-md text-subtle">
            Rreviewed 3 hours ago by Gabriel
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import jobInformationStatus from './job-information-status.vue'
</script>

<style lang="scss">
div#cnn-job-information-input {
  grid-template-columns: 24px 1fr;
}

div#cnn-job-information-status {
  grid-template-columns: 24px 1fr;
}
</style>
