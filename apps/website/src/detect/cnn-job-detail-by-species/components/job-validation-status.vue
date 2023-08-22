<template>
  <div
    class="job-result-validation-status-wrapper border-1 border-box-grey rounded-md px-6 py-4 mt-4"
    style="width: fit-content;"
  >
    <div class="lg:pr-24">
      <h3 class="job-result-validation-status-header text-subtle text-sm mb-2">
        Validation status
      </h3>
      <div
        id="job-result-validation-status-grid-table"
        class="grid gap-x-4"
        style="grid-template-columns: fit-content(4rem) 1fr;"
      >
        <span class="font-semibold justify-self-start text-right text-lg">0</span>
        <span class="text-lg">Unvalidated</span>
        <span class="font-semibold justify-self-start text-right text-lg">123</span>
        <span class="text-lg">Present</span>
        <span class="font-semibold justify-self-start text-right text-lg">123</span>
        <span class="text-lg">Not present</span>
        <span class="font-semibold justify-self-start text-right text-lg">123</span>
        <span class="text-lg">Unknown</span>
      </div>
    </div>
  </div>
</template>
