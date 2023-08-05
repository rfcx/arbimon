<template>
  <div class="flex flex-row rounded-lg border-1 border-frequency">
    <div
      v-if="!isShowingBio"
      class="w-full h-full"
    >
      <img
        class="rounded-t-lg border-b-1 border-b-frequency w-full object-cover"
        :src="imageUrl"
      >
      <div class="p-6 text-left">
        <p class="text-flamingo text-base lg:text-lg">
          {{ name }}
        </p>
        <p class="font-medium py-2">
          {{ role }}
        </p>
        <button
          class="cursor-pointer text-frequency"
          @click="isShowingBio = true"
        >
          About
        </button>
      </div>
    </div>
    <div
      v-else
      class="h-full w-full bg-frequency p-6 flex flex-col justify-between gap-4 text-left"
    >
      <div>
        <div class="flex flex-row justify-between mb-4">
          <p class="text-flamingo text-base lg:text-lg">
            {{ name }}
          </p>
          <button
            class="cursor-pointer text-util-gray-03"
            @click="isShowingBio = false"
          >
            X
          </button>
        </div>
        <p class="text-util-gray-03">
          {{ bio }}
        </p>
      </div>
      <a
        href="#"
        class="text-util-gray-03 hover-underline"
      >LinkedIn</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const isShowingBio = ref<boolean>(false)
defineProps<{
  readonly imageUrl: string
  readonly name: string
  readonly role: string
  readonly bio: string
}>()
</script>
