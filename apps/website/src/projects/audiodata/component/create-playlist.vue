<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
    @click.self="close"
  >
    <div class="input-item-playlist bg-moss text-white rounded-xl w-full max-w-[600px] px-6 py-6 relative shadow-lg">
      <button
        class="absolute top-4 right-4 text-white hover:opacity-70"
        aria-label="Close"
        @click="close"
      >
        <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
      </button>

      <h2 class="text-[24px] font-bold mb-4">
        Create playlist
      </h2>

      <label class="text-md font-bold mb-1 block">Playlist name</label>
      <input
        v-model="playlistName"
        type="text"
        class="rounded mt-2 py-2 h-[34px] w-full items-center inline-flex rounded border-1 border-util-gray-03 bg-echo"
      >
      <p
        v-if="showError"
        class="text-red-400 text-sm mb-1 mt-2"
      >
        Playlist is already in use. Please try again.
      </p>
      <div class="flex justify-between space-x-4 mt-8">
        <button
          class="btn btn-secondary btn-medium ml-2 btn-small items-center inline-flex px-5 bg-echo text-[16px] py-3"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary btn-medium ml-2 btn-small items-center inline-flex px-6 disabled:hover:btn-disabled disabled:btn-disabled text-[16px] py-[10px]"
          :disabled="!playlistName.trim() || isLoading"
          @click="save"
        >
          Save
          <icon-custom-ic-loading-dark
            v-if="isLoading"
            class="animate-spin text-xl ml-2 inline-flex"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const emit = defineEmits<{(e: 'close'): void, (e: 'save', playlistName: string): void}>()

const playlistName = ref('')
const isLoading = ref(false)

const props = defineProps<{
  playlistNameExists?: boolean
}>()

const showError = computed(() => {
  return props.playlistNameExists && playlistName.value.trim() !== ''
})

watch(showError, (val) => {
  if (val) {
    isLoading.value = false
  }
})

function close () {
  emit('close')
}

function save () {
  isLoading.value = true
  if (playlistName.value.trim()) {
    emit('save', playlistName.value.trim())
  }
}
</script>

<style lang="scss">
.input-item-playlist {
  [type='text']:focus {
    border-color: #ADFF2C;
    --tw-ring-color: transparent;
  }
  color: #fff;
}
</style>
