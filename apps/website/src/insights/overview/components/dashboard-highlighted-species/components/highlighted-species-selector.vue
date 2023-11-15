<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in emptySpecies"
      :key="item.title"
      class="flex flex-row justify-between items-center rounded gap-x-3 p-4 h-21 bg-util-gray-01"
    >
      <div class="flex flex-row justify-between items-center gap-x-2">
        <div class="min-h-14 h-14 min-w-14 w-14 object-cover rounded bg-util-gray-02" />
        <div class="self-center min-w-40 hover:(text-subtle)">
          <p class="italic">
            {{ item.title }}
          </p>
          <p class="text-xs text-subtle">
            {{ item.subtitle }}
          </p>
        </div>
      </div>
      <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emptyRow = ref({
  title: 'Specie',
  subtitle: 'Not selected'
})

const emptySpecies = ref(Array(5).fill(emptyRow.value))
</script>

<style lang="scss">
.species-highlights {
  height: 1rem;
}
</style>
