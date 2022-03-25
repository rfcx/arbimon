<template>
  <select
    v-model="selectedVersion"
    class="bg-subtle px-3 py-1 w-40"
  >
    <option
      value="draft"
      class="bg-steel-grey border-none"
    >
      Draft
    </option>
    <option
      value="publish"
      class="bg-subtle border-none"
    >
      Publish
    </option>
  </select>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const selectedVersion = ref('draft')
</script>
