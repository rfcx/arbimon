<template>
  <div>
    <h1 class="text-xl">
      Almost there
    </h1>
    <p class="text-light-500">
      Tell us a bit more about your Arbimon needs
    </p>

    <p>Question 1</p>
    <p>Question 2</p>

    <button @click="next">
      Continue
    </button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'

import { ROUTE_NAMES } from '~/router'

const router = useRouter()

async function next () {
  await router.push({ name: ROUTE_NAMES.createProject, query: { first: 1 } })
}
</script>
