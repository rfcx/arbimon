<template>
  <div class="mt-6 flex flex-col gap-y-[17px]">
    <h5>Test project</h5>
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
    <span class="text-xs">Make sure the Project’s Insight is hidden to make it a test project.</span>
    <div class="flex flex-row">
      <input
        id="project-settings-listed-project-checkbox"
        type="checkbox"
        class="w-5 h-5 border mb-1 border-util-gray-01 rounded cursor-pointer  dark:bg-echo focus:border-white-600 focus:ring-frequency dark:border-white-600 dark:focus:ring-frequency dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{ isPublic: boolean | undefined, isDisabled?: boolean }>()

const emit = defineEmits<{(e: 'emitProjectListed', value: boolean): void}>()

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
