<template>
  <ul class="flex flex-col gap-y-2">
    <li
      v-for="item in emptySpecies"
      :key="item.title"
      class="flex items-center"
    >
      <div
        class="min-h-14 h-14 min-w-14 w-14 object-cover rounded bg-util-gray-02"
      />
      <div
        class="ml-4 self-center hover:(text-subtle)"
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
