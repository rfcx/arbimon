<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
    @click.self="close"
  >
    <div class="bg-moss text-white rounded-xl w-full max-w-[600px] px-6 py-6 relative shadow-lg">
      <button
        class="absolute top-4 right-4 text-white hover:opacity-70"
        aria-label="Close"
        @click="close"
      >
        <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
      </button>

      <h2 class="text-[24px] font-bold mb-3">
        Export report
      </h2>
      <p class="mb-2 text-md">
        Enter your email to get the report delivered to your inbox.
      </p>

      <label class="text-md font-bold mb-1 block">Email</label>
      <input
        v-model="email"
        type="email"
        placeholder="your@email.com"
        class="rounded py-2 h-[34px] w-full items-center inline-flex border border-util-gray-03 bg-echo px-3 text-white"
      >

      <div class="flex justify-between space-x-4 mt-8">
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-5 bg-echo"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary btn-medium ml-2 btn-small items-center inline-flex px-5"
          :disabled="!email.trim()"
          @click="exportReport"
        >
          Export
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useStore } from '~/store'

const emit = defineEmits<{(e: 'close'): void, (e: 'export', email: string): void}>()

const email = ref('')
const store = useStore()

onMounted(() => {
  email.value = store.user?.email ?? ''
})

function close () {
  emit('close')
}

function exportReport () {
  if (email.value.trim()) {
    emit('export', email.value.trim())
  }
}
</script>
