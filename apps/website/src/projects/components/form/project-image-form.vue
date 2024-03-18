<template>
  <div class="flex flex-col gap-y-6">
    <h5>Photo</h5>
    <div class="flex flex-row justify-between gap-y-2">
      <div class="flex flex-col">
        <div class="flex flex-row">
          <span class="font-medium">Project thumbnail photo</span>
          <icon-i-info
            tooltip-id="project-settings-project-image"
            :tooltip-text="'Upload your project photo.'"
          />
        </div>
        <p>Recommended size: 380 px by 180 px</p>
      </div>
      <div v-if="!isDisabled">
        <input
          id="profileFileUpload"
          type="file"
          accept="image/jpeg, image/png"
          hidden
          @change="uploadPhoto"
        >
        <button
          class="btn btn-secondary group"
          type="button"
          @click="selectPhoto"
        >
          Upload file <icon-custom-cloud-upload class="ml-2 group-hover:stroke-pitch inline-flex" />
        </button>
      </div>
    </div>
    <div>
      <img
        v-if="projectImage"
        :src="projectImage"
        alt="Project photo"
        class="w-95 h-45 aspect-video object-cover rounded-2xl bg-util-gray-03"
      >
      <div
        v-else
        class="w-95 h-45 aspect-video object-cover rounded-2xl bg-util-gray-03"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, onMounted, ref } from 'vue'

import IconIInfo from '../icon-i-info.vue'

const maxWidth = 600
const maxHeight = 600

const props = defineProps<{ isDisabled?: boolean, image?: string }>()

const emit = defineEmits<{(e: 'emitProjectImage', file: File): void}>()

const uploadedPhotoUrl = ref('')

const projectImage = computed(() => {
  return uploadedPhotoUrl.value ? uploadedPhotoUrl.value : props.image
})

const widthAndHeightIsInRange = (img: HTMLImageElement) => {
  return img.width < maxWidth && img.height < maxHeight
}

const selectPhoto = async (): Promise<void> => {
  document.getElementById('profileFileUpload')?.click()
}

const uploadPhoto = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const file: File = (target.files as FileList)[0]
  const readerUrl = new FileReader()
  readerUrl.addEventListener('load', e => {
    uploadedPhotoUrl.value = e.target?.result as string
    const img = new Image()
    img.src = e.target?.result as string
    img.onload = () => {
      if (widthAndHeightIsInRange(img)) {
        return emit('emitProjectImage', file)
      } else {
        resize(e, img, file)
      }
    }
  })
  readerUrl.readAsDataURL(file)
}

const resize = (e: Event, img: HTMLImageElement, file: File) => {
  let width = maxWidth
  let height = maxHeight

  if (img.width > maxWidth && img.height > maxHeight) {
    if (img.height > img.width) {
      height = maxHeight
      const ration = maxHeight / img.height
      width = Math.round(img.width * ration)
    } else {
      width = maxWidth
      const ration = maxWidth / img.width
      height = Math.round(img.height * ration)
    }
  } else if (img.width > maxWidth) {
    width = maxWidth
    const ration = maxWidth / img.width
    height = Math.round(img.height * ration)
  } else {
    height = maxHeight
    const ration = maxHeight / img.height
    width = Math.round(img.width * ration)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  let newfile: File = file
  canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
  canvas.toBlob((blob) => {
    if (!blob) return
    newfile = new File([blob], 'converted-image.jpg', { type: 'image/jpeg' })
    return emit('emitProjectImage', newfile)
  }, 'image/jpeg')
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
