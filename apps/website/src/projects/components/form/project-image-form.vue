<template>
  <div class="flex flex-col gap-y-6">
    <h4>Photo</h4>
    <div class="flex flex-col md:flex-row justify-between gap-y-4">
      <div class="flex flex-col">
        <div class="flex flex-row">
          <span class="font-medium text-secondary">Project thumbnail photo</span>
          <icon-i-info
            tooltip-id="project-settings-project-image"
            :tooltip-text="'Upload your project photo.'"
          />
        </div>
        <p class="text-secondary">
          Recommended size: 380 px by 180 px
        </p>
        <button
          class="btn btn-secondary group mt-4 w-42 btn-medium"
          type="button"
          @click="selectPhoto"
        >
          Upload file <icon-custom-ic-upload class="ml-2 group-hover:stroke-pitch inline-flex w-4 h-4" />
        </button>
        <div
          v-if="isLargeFile"
          class="mt-3"
        >
          <p class="text-flamingo text-sm">
            <span
              class="text-sm font-medium"
              role="alert"
            >
              Upload Error: File Too Large.
            </span>
            The image must be smaller than 5MB. <br>
            Please choose a file that meets this size requirement to continue.
          </p>
        </div>
      </div>
      <div v-if="!isDisabled">
        <input
          id="profileFileUpload"
          type="file"
          accept="image/jpeg, image/png"
          hidden
          @change="uploadPhoto"
        >
        <img
          v-if="projectImage"
          :src="projectImage"
          alt="Project photo"
          class="w-full md:(w-95 h-45) aspect-video object-cover rounded-2xl bg-util-gray-03"
        >
        <div
          v-else
          class="w-full md:(w-95 h-45) aspect-video object-cover rounded-2xl bg-util-gray-03"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const maxSize = 600

const props = defineProps<{ isDisabled?: boolean, image?: string }>()

const emit = defineEmits<{(e: 'emitProjectImage', file: File): void}>()

const uploadedPhotoUrl = ref('')

const projectImage = computed(() => {
  return uploadedPhotoUrl.value ? uploadedPhotoUrl.value : props.image
})

const selectPhoto = async (): Promise<void> => {
  document.getElementById('profileFileUpload')?.click()
}

const file = ref<File | null>(null)

const isLargeFile = computed(() => {
  return file.value ? file.value.size > 5 * 1024 * 1024 : false
})

const uploadPhoto = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const file: File = (target.files as FileList)[0]

  const readerUrl = new FileReader()
  readerUrl.addEventListener('load', e => {
    uploadedPhotoUrl.value = e.target?.result as string
    const img = new Image()
    img.src = e.target?.result as string
    img.onload = async () => {
      if (img.width < maxSize && img.height < maxSize) {
        emit('emitProjectImage', file)
      } else {
        const resizedImageFile = await resize(img, file.name)
        emit('emitProjectImage', resizedImageFile)
      }
    }
  })
  readerUrl.readAsDataURL(file)
}

const resize = async (img: HTMLImageElement, fileName: string): Promise<File> => {
  const sizeImage = getSize(img.width, img.height, maxSize)
  const canvas = document.createElement('canvas')
  canvas.width = sizeImage.width
  canvas.height = sizeImage.height
  canvas.getContext('2d')?.drawImage(img, 0, 0, sizeImage.width, sizeImage.height)
  return await new Promise(resolve => canvas.toBlob(blob => {
    if (blob) {
      resolve(new File([blob], fileName, { type: blob.type }))
    }
  }))
}

const getSize = (imageWidth: number, imageHeight: number, maxSize: number): {width: number, height: number} => {
  const oldBiggestDimension = Math.max(imageWidth, imageHeight)
  const maxNewSize = Math.min(oldBiggestDimension, maxSize)
  const ratio = oldBiggestDimension === 0 ? oldBiggestDimension : maxNewSize / oldBiggestDimension
  return { width: ratio * imageWidth, height: ratio * imageHeight }
}

onMounted(() => {
  initTooltips()
})

</script>

<style lang="scss">
svg {
  margin-top: 0;
}
</style>
