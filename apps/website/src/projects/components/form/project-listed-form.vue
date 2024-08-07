<template>
  <div class="mt-6 flex flex-col gap-y-4">
    <h4 v-if="!isCreateProject">
      Test project
    </h4>
    <div class="flex flex-col lg:(flex-row) items-start gap-4">
      <div
        class="flex flex-col gap-y-6 w-full"
        :class="{'lg:w-2/4': !isCreateProject}"
      >
        <p class="text-secondary">
          Your project's basic information, such as its name, will be listed and searchable on Arbimon.
          Detailed insights can be shared at your discretion. Review our
          <a
            href=" https://rfcx.org/privacy-policy"
            class="text-frequency underline"
          >
            privacy policies
          </a>
        </p>
      </div>
      <div
        v-if="!isCreateProject && isDisabled"
        class="bg-echo flex flex-row items-center px-4 py-3 border-1 rounded-lg border-util-gray-03"
      >
        <icon-custom-alert-triangle class="h-6 w-6 cursor-pointer text-chirp" />
        <span
          class="ml-3 text-insight"
          role="alert"
        >
          Make sure the Project’s Insight is hidden to make it a test project.
        </span>
      </div>
    </div>
    <div class="flex flex-row">
      <input
        id="project-settings-listed-project-checkbox"
        type="checkbox"
        class="w-5 h-5 border-2 mb-1 rounded cursor-pointer dark:bg-echo border-white focus:ring-frequency dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
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
        :extra-class="`w-100`"
        :extra-class-icon="isDisabled ? 'text-util-gray-02' : '' "
        tooltip-id="project-settings-project-listed"
        :tooltip-text="infoIconText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const props = defineProps<{ isPublic: boolean | undefined, isDisabled?: boolean, isCreateProject?: boolean }>()
const emit = defineEmits<{(e: 'emitProjectListed', value: boolean): void}>()

// eslint-disable-next-line regex/invalid
const infoIconText = ref('Selecting this creates a private test project, which may be periodically archived and become inaccessible. Uncheck for permanent access.')
const isPublicProject = ref(props.isPublic)

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
