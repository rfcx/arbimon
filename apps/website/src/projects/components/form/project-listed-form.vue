<template>
  <div class="mt-6 flex flex-col gap-y-[17px]">
    <p>
      Your project's basic information, such as its name, will be listed and searchable on Arbimon.
      Detailed insights can be shared at your discretion. Review our
      <a
        href=" https://rfcx.org/privacy-policy"
        class="text-frequency underline"
      >
        privacy policies
      </a>
    </p>
    <div class="flex flex-row">
      <input
        id="project-settings-listed-project-checkbox"
        type="checkbox"
        class="w-5 h-5 border mb-1 border-util-gray-01 rounded dark:bg-echo focus:border-white-600 focus:ring-frequency dark:border-white-600 dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
        :disabled="isDisabled"
        :checked="!isPublic"
        @click="toggleListedProject()"
      >
      <label class="ml-2">
        This is a test project, do NOT list it on Arbimon.
      </label>
      <icon-i-info
        tooltip-id="project-settings-listed-project-tooltip"
        :tooltip-text="'Do not list the project on Arbimon if the checkbox is selected'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = defineProps<{ isPublic: boolean, isDisabled?: boolean }>()

const emit = defineEmits<{(e: 'emitProjectListed', value: boolean): void}>()

const isPublic = ref<boolean>(props.isPublic)

const toggleListedProject = () => {
  isPublic.value = !isPublic.value
  emit('emitProjectListed', isPublic.value)
}

onMounted(() => {
  initTooltips()
})

</script>

<style lang="scss">
svg {
  margin-top: 0;
}
</style>
