<template>
  <div
    class="flex flex-row rounded-lg border-1 border-frequency h-64 md:h-[500px]"
  >
    <div
      v-if="!isShowingBio"
      class="w-full h-full flex flex-row-reverse md:flex-col"
    >
      <img
        class="rounded-r-lg border-l-1 border-l-frequency border-b-0 w-1/2 h-full md:(w-full h-2/3 rounded-t-lg rounded-br-none border-b-1 border-b-frequency border-l-0) object-cover"
        :src="imageUrl"
      >
      <div class="flex flex-col items-start justify-between content-stretch pt-6 px-6 pb-8 text-left self-stretch flex-grow flex-1">
        <div class="">
          <p class="text-flamingo text-lg">
            {{ name }}
          </p>
          <p class="font-medium py-2">
            {{ role }}
          </p>
        </div>
        <button
          class="cursor-pointer text-frequency font-display"
          @click="isShowingBio = true"
        >
          About
        </button>
      </div>
    </div>
    <div
      v-else
      class="h-full w-full bg-frequency pt-6 px-6 pb-8 flex flex-col justify-between gap-4 text-left items-stretch rounded-lg"
    >
      <div>
        <div class="flex flex-row justify-between mb-4">
          <p class="text-flamingo text-lg">
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
        class="text-util-gray-03 hover-underline font-display"
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
