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
          <h1 class="text-lg">
            Diurnal
          </h1>
        </div>
      </div>
      <div>
        <span class="text-subtle">Status</span>
        <jobInformationStatus />
      </div>
      <div>
        <span class="text-subtle">Validation Status</span>
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
</style>
