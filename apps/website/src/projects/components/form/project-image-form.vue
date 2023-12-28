<template>
  <div class="mt-6 flex flex-col gap-y-2">
    <div class="flex flex-row">
      <span class="font-medium">Project thumbnail photo</span>
      <icon-i-info
        tooltip-id="project-settings-project-image"
        :tooltip-text="'Project thumbnail photo'"
      />
    </div>
    <p>Recommended size: XXXX px by XXX px</p>
    <div>
      <input
        id="profileFileUpload"
        type="file"
        accept="image/jpeg, image/png"
        hidden
        :disabled="isDisabled"
        @change="uploadPhoto"
      >
      <button
        class="btn btn-secondary group w-full"
        type="button"
        @click="selectPhoto"
      >
        Upload file <icon-custom-cloud-upload class="ml-2 group-hover:stroke-pitch inline-flex" />
      </button>
</div>
  </div>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { type Ref, onMounted, ref } from 'vue'

import IconIInfo from '../icon-i-info.vue'

defineProps<{ isDisabled?: boolean }>()

const emit = defineEmits<{(e: 'emitProjectImage', form: FormData): void}>()

const uploadedFile = ref()
const uploadedPhotoUrl = ref('')
const uploadedPhotoData: Ref<Record<string, string>> = ref({
  name: '',
  type: ''
})

const onEmitProjectImage = () => {
  const imageFileAsBlobType = new File([new Blob([uploadedFile.value as BlobPart])], uploadedPhotoData.value.name, {
    type: uploadedPhotoData.value.type
  })
  const form = new FormData()
  form.append('image', imageFileAsBlobType, uploadedPhotoData.value.name)
  console.info(form.getAll('image'))
  emit('emitProjectImage', form)
}

const selectPhoto = async (): Promise<void> => {
  document.getElementById('profileFileUpload')?.click()
}

const uploadPhoto = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const file: File = (target.files as FileList)[0]
  uploadedPhotoData.value.name = file.name
  uploadedPhotoData.value.type = file.type
  // the browser has NO ACCESS to the file path for security reasons
  const readerUrl = new FileReader()
  const readerBuffer = new FileReader()
  readerUrl.addEventListener('load', e => {
    uploadedPhotoUrl.value = e.target?.result as string
  })
  readerBuffer.addEventListener('load', e => {
    uploadedFile.value = e.target?.result
  })
  readerUrl.readAsDataURL(file)
  readerBuffer.readAsArrayBuffer(file)
  onEmitProjectImage()
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
