<template>
  <div class="flex items-center justify-start space-x-3 py-4 pr-4">
    <img
      v-if="image"
      class="w-12 h-12 mr-3 rounded-full shadow"
      :src="image"
      @error="replaceByDefault"
    >
    <div
      v-else
      class="w-12 h-12 mr-3 rounded-full shadow bg-util-gray-03"
    />
    <div>
      <span
        v-if="ranking === 0"
        class="text-xs text-pitch bg-frequency font-normal font-eyebrow font-sans leading-5 px-2 rounded-sm inline-block"
      >
        Primary contact
      </span>
      <h3 class="text-base font-normal font-sans">
        {{ name }}
      </h3>
      <h3
        v-if="description"
        class="text-sm font-normal"
      >
        {{ description }}
      </h3>
      <a
        v-if="email && ranking === 0"
        class="text-util-gray-01 text-sm font-normal leading-tight inline hover:underline hover:cursor-pointer"
        :href="`mailto:${email}`"
      >
        {{ email }}
      </a>
      <button
        v-if="email && ranking === 0"
        type="button"
        class="transparent text-frequency text-sm ml-3 inline"
        @click="copyEmail(email)"
      >
        {{ isCopied ? 'Copied' : 'Copy' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ name: string, description?: string, email?: string, image?: string, ranking?: number }>()

const isCopied = ref<boolean>(false)

const copyEmail = async (email: string):Promise<void> => {
  isCopied.value = true
  await navigator.clipboard.writeText(email)
  setTimeout(() => {
    isCopied.value = false
  }, 1000)
}

const replaceByDefault = (event: Event) => {
  (event.target as HTMLImageElement).src = new URL('@/_assets/default-stakeholder-image.png', import.meta.url).toString()
}
</script>
