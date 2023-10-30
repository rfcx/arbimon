<template>
  <label
    for="name"
    class="block mb-2 font-medium text-gray-900 dark:text-insight"
  >Project objectives</label>
  <ul class="w-full">
    <li
      v-for="obj in objectiveTypes"
      :key="obj.slug"
      class="flex flex-row flex-1 mt-4"
    >
      <input
        :id="obj.slug"
        type="checkbox"
        value=""
        class="hidden peer"
      >
      <label
        :for="obj.slug"
        class="font-medium font-display flex-1 cursor-pointer w-full px-6 py-3 bg-moss rounded-lg peer-checked:border-1 dark:peer-checked:border-frequency hover:bg-util-gray-02/60"
        @click="onSelectObjective(obj)"
      >
        {{ obj.description }}
      </label>
      <input
        v-if="obj.slug === 'others'"
        type="text"
        class="input-field ml-4 w-full"
      >
    </li>
  </ul>
</template>

<script setup lang="ts">

import { ref } from 'vue'

import { type ProjectObjective, objectiveTypes } from '../../types'

const emit = defineEmits<{(e: 'emitProjectObjectives', objectives: ProjectObjective[]): void}>()

const selectedObjectives = ref<ProjectObjective[]>([])

const onSelectObjective = (objective: ProjectObjective) => {
  const existingSelectedIds = selectedObjectives.value.map((obj) => obj.id)
  if (existingSelectedIds.includes(objective.id)) { // remove from list
    selectedObjectives.value = selectedObjectives.value.filter((obj) => obj.id !== objective.id)
  } else { // add to list
    selectedObjectives.value = [...selectedObjectives.value, objective]
  }
  emit('emitProjectObjectives', selectedObjectives.value)
}

</script>
