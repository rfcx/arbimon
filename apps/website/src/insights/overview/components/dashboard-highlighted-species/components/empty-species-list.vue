<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in emptySpecies"
      :key="item.title"
      class="flex flex-row justify-start items-center gap-x-4"
    >
      <div
        class="min-h-16 h-16 min-w-16 w-16 object-cover rounded bg-util-gray-02"
      />
      <div
        class="self-center"
      >
        <p class="italic">
          {{ item.title }}
        </p>
        <p class="text-xs text-subtle">
          {{ item.subtitle }}
        </p>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emptyRow = ref({
  title: 'Highlight speices',
  subtitle: 'Not selected'
})

const emptySpecies = ref(Array(5).fill(emptyRow.value))
</script>

<style lang="scss">
.species-highlights {
  height: 1rem;
}
</style>
