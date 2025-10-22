<template>
  <div class="a2-img">
    <div
      v-if="isLoading && !tileSrc"
      class="flex h-240 justify-center items-center border-1 border-util-gray-03"
    >
      <div class="inline-flex items-center">
        <icon-custom-ic-loading class="animate-spin h-6 w-6" />
      </div>
    </div>
    <img
      v-if="tileSrc"
      :src="src"
      class="block"
      @load="onLoad"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const props = defineProps<{
  tileSrc: string | null
}>()

const isLoading = ref<boolean>(false)
const src = ref<string>('')

const onLoad = () => {
  isLoading.value = false
}

watch(() => props.tileSrc, (newSrc) => {
  if (!newSrc) {
    src.value = ''
    isLoading.value = false
    return
  }

  isLoading.value = true

  // preload
  const image = new Image()
  image.onload = () => {
    src.value = image.src
  }
  image.src = `${ARBIMON_BASE_URL}${newSrc}`
}, { immediate: true })
</script>

<style lang="scss">
.a2-img {
  position: relative;
  width    : 100%;
  height   : 100%;
  image-rendering: -webkit-optimize-contrast;
  > img {
    position : absolute;
    width    : 100%;
    height   : 100%;
    z-index  : 1;
  }
  &.loading{
    outline:1px solid black;
    > img {
      opacity: .8;
    }
  }
  > loader {
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    display:none;
    z-index:2;
  }
}

.a2-img.loading img {
  opacity: 0.5;
}
</style>
