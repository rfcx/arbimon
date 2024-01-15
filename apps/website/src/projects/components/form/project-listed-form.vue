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
        class="w-5 h-5 border-2 mb-1 rounded cursor-pointer  dark:bg-echo border-white focus:ring-frequency dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
        :disabled="isDisabled"
        :checked="!isPublicProject"
        @click="toggleListedProject()"
      >
      <label
        class="ml-2"
        :class="{'text-util-gray-02': isDisabled}"
      >
        This is a test project, do NOT list it on Arbimon.
      </label>
      <icon-i-info
        class="w-50"
        tooltip-id="test-project"
        :tooltip-text="PLACEHOLDER_TEXT"
        :extra-class="`w-100`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = defineProps<{ isPublic: boolean | undefined, isDisabled?: boolean }>()

const emit = defineEmits<{(e: 'emitProjectListed', value: boolean): void}>()

const isPublicProject = ref(props.isPublic)
const PLACEHOLDER_TEXT = 'Selecting this creates a private test project, which may be periodically archived and become inaccessible. Uncheck for permanent access.'

const toggleListedProject = () => {
  isPublicProject.value = !isPublicProject.value
  emit('emitProjectListed', isPublicProject.value)
}

watch(() => props.isPublic, (newVal) => {
  isPublicProject.value = newVal
})

onMounted(() => {
  initTooltips()
  isPublicProject.value = props.isPublic
})

</script>

<style lang="scss">
svg {
  margin-top: 0;
}
</style>
