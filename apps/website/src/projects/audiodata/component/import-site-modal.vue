<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
  >
    <div class="bg-moss text-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
      <button
        class="absolute top-5 right-4"
        type="button"
        data-modal-toggle="project-delete-modal"
        title="Cancel"
        @click="close"
      >
        <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
      </button>
      <h2 class="text-2xl font-bold mb-4">
        Import site
      </h2>
      <p class="mb-4">
        To import a list of sites, please provide a CSV file in the following format below. You must include a header in your file and coordinates must be in decimal degree format.
      </p>

      <div class="bg-[#ebebeb] text-sm text-moss font-mono rounded-md p-4 overflow-x-auto mb-4 whitespace-pre">
        name,lat,lon,alt<br>
        Site_1,16.09887,100.9392,0<br>
        Site_2,13.13304,110.9452,0<br>
        Site_3,49.09308,90.3492,0<br>
        Site_4,56.09887,150.9252,0<br>
        Site_5,33.00309,10.7892,0
      </div>

      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        class="hidden"
        @change="handleFileUpload"
      >
      <div class="flex flex-row justify-center items-center mt-8 gap-x-4">
        <button
          class="px-4 py-2 btn btn-secondary btn-medium w-full"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 btn btn-medium w-full btn-primary"
          @click="triggerFileSelect"
        >
          Select file
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineExpose, ref } from 'vue'

const isOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{(e: 'imported', csvData: string): void}>()

function open () {
  isOpen.value = true
}
function close () {
  isOpen.value = false
}
function triggerFileSelect () {
  fileInput.value?.click()
}

function handleFileUpload (event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const reader = new FileReader()
  reader.onload = () => {
    const csvText = reader.result as string
    emit('imported', csvText)
    close()
  }
  reader.readAsText(files[0])
}

defineExpose({ open })
</script>
