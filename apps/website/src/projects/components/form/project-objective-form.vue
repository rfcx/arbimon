<template>
  <label
    for="name"
    class="block mb-2 font-medium text-gray-900 dark:text-insight"
  >Project objectives*</label>
  <ul class="w-full">
    <li
      v-for="obj in objectiveTypes"
      :key="obj.slug"
      class="flex flex-row flex-1 mt-4"
    >
      <div
        :class="{
          'border-1 border-frequency': isSelected(obj.id),
        }"
        class="font-medium font-display flex-1 cursor-pointer w-full px-6 py-3 bg-moss rounded-lg hover:bg-util-gray-02/60"
        @click="onSelectObjective(obj)"
      >
        {{ obj.description }}
      </div>
      <input
        v-if="obj.slug === 'others'"
        v-model="otherReason"
        type="text"
        class="input-field ml-4 w-full"
        :class="{'border-1 border-frequency': isSelected(obj.id)}"
        @click="forceSelectOther"
      >
    </li>
  </ul>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'

import { type ProjectObjective, masterOjectiveTypes, objectiveTypes } from '../../types'

const props = defineProps<{
  existingObjectives?: string[]
}>()
const emit = defineEmits<{(e: 'emitProjectObjectives', objectives: ProjectObjective[]): void}>()

const selectedObjectives = ref<ProjectObjective[]>([])
const otherReason = ref<string>('')

const isSelected = (id: number) => {
  const existingSelectedIds = selectedObjectives.value.map((obj) => obj.id)
  return existingSelectedIds.includes(id)
}

const onSelectObjective = (objective: ProjectObjective) => {
  if (isSelected(objective.id)) { // remove from list
    selectedObjectives.value = selectedObjectives.value.filter((obj) => obj.id !== objective.id)
  } else { // add to list
    selectedObjectives.value = [...selectedObjectives.value, objective]
  }
  emit('emitProjectObjectives', selectedObjectives.value)
}

// use when user types in other reason
const forceSelectOther = () => {
  const defaultOtherObj = masterOjectiveTypes.Others
  if (!isSelected(defaultOtherObj.id)) {
    const obj = updateOtherObjectDescription(defaultOtherObj, otherReason.value)
    selectedObjectives.value = [...selectedObjectives.value, obj]
  }
  emit('emitProjectObjectives', selectedObjectives.value)
}

// use when user remove all text from other reason
const unselectOther = () => {
  selectedObjectives.value = selectedObjectives.value.filter((obj) => obj.id !== masterOjectiveTypes.Others.id)
  emit('emitProjectObjectives', selectedObjectives.value)
}

const onUpdateOtherReason = () => {
  const existingOtherObj = selectedObjectives.value.find((obj) => obj.id === masterOjectiveTypes.Others.id)
  if (existingOtherObj) {
    const updatedObject = updateOtherObjectDescription(existingOtherObj, otherReason.value)
    // replace existing object with newer reason
    selectedObjectives.value = selectedObjectives.value.map((obj) => obj.id === masterOjectiveTypes.Others.id ? updatedObject : obj)
  } else {
    const obj = updateOtherObjectDescription(masterOjectiveTypes.Others, otherReason.value)
    selectedObjectives.value = [...selectedObjectives.value, obj]
  }
  emit('emitProjectObjectives', selectedObjectives.value)
}

const updateOtherObjectDescription = (originalObj: ProjectObjective, reason: string) => {
  return { ...originalObj, description: reason }
}

const setupExistingObjectivesIfNeeded = () => {
  if (!props.existingObjectives || props.existingObjectives?.length === 0) return
  selectedObjectives.value = props.existingObjectives.map((obj) => {
    const objectiveType = objectiveTypes.find((o) => o.slug === obj)
    if (!objectiveType) otherReason.value = obj // no match, must be other reason
    return objectiveType ?? masterOjectiveTypes.Others
  })
}

onMounted(() => {
  setupExistingObjectivesIfNeeded()
})

watch(otherReason, () => {
  if (otherReason.value.length === 0) {
    unselectOther()
  } else {
    onUpdateOtherReason()
  }
})
</script>
