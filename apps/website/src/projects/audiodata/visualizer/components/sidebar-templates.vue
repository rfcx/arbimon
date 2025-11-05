<template>
  <div
    id="accordion-collapse"
    data-accordion="collapse"
    class="flex flex-col gap-y-2 px-4 py-2 bg-moss shadow"
  >
    <div id="accordion-collapse-heading-templates">
      <button
        type="button"
        class="flex justify-between items-center w-full py-2 gap-x-1 text-insight dark:(bg-transparent text-insight)"
        data-accordion-target="#accordion-collapse-body-templates"
        aria-expanded="false"
        aria-controls="accordion-collapse-body-templates"
      >
        <div>
          <icon-fa-chevron-right
            data-accordion-icon
            class="w-3 h-3 fa-chevron-right"
          />
          <icon-fa-chevron-down
            data-accordion-icon
            class="w-3 h-3 fa-chevron-up hidden"
          />
          <span class="ml-1">Templates (Pattern Matching Analysis)</span>
        </div>
        <div
          @click="toggleVisible = !toggleVisible"
          @click.stop
        >
          <icon-fa-eye
            v-if="toggleVisible"
            class="h-5 w-5"
          />
          <icon-fa-eye-slash
            v-else
            class="h-5 w-5"
          />
        </div>
      </button>
    </div>
    <div
      id="accordion-collapse-body-templates"
      class="hidden w-[90%] flex flex-col gap-y-2 text-sm font-medium"
      aria-labelledby="accordion-collapse-heading-templates"
    >
      There are no templates in this recording.
    </div>
    <!-- TODO: Add detail after drew box on spectrogram (unnamed template, no species selected and ...s, ...kHz)-->
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import type { Visobject } from '@rfcx-bio/common/api-arbimon/audiodata/visualizer'

defineProps<{
  visobject: Visobject
}>()

const toggleVisible = ref<boolean>(true)
// TODO: When click on ic-eye to hander hied/show Templates box on spectrogram

</script>

<style lang="scss">

button[aria-expanded=true] .fa-chevron-up {
  display: inline-block;
}
button[aria-expanded=true] .fa-chevron-right {
  display: none;
}
button[aria-expanded=flase] .fa-chevron-up {
  display: none;
}
button[aria-expanded=false] .fa-chevron-right {
  display: inline-block;
}

input::placeholder::-webkit-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
  font-size: 10px !important;
}
input::placeholder::-moz-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder::-ms-input-placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity));
}
input::placeholder {
  --tw-placeholder-opacity: 1;
  color: rgba(161, 161, 158, var(--tw-placeholder-opacity)) !important;
}
</style>
