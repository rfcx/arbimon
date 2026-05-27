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
      class="block crisp-image"
      @load="onLoad"
    >
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

import { acquireTileSlot } from './visualizer-tile-loader'

const ARBIMON_BASE_URL = import.meta.env.VITE_ARBIMON_LEGACY_BASE_URL

const props = defineProps<{
  tileSrc: string | null
}>()

const isLoading = ref<boolean>(false)
const src = ref<string>('')

// Each in-flight preload owns a release() that returns its slot to the global
// tile-loader semaphore. We track the current one so cancellation (component
// unmount / src change) can free the slot immediately.
let releaseSlot: (() => void) | null = null
// Generation counter prevents a late-arriving preload (from a previous src)
// from clobbering the current src.
let generation = 0

const cancelInFlight = () => {
  if (releaseSlot) {
    releaseSlot()
    releaseSlot = null
  }
}

const onLoad = () => {
  isLoading.value = false
}

watch(() => props.tileSrc, (newSrc) => {
  cancelInFlight()
  const myGen = ++generation

  if (!newSrc) {
    src.value = ''
    isLoading.value = false
    return
  }

  isLoading.value = true

  const finalUrl = newSrc.startsWith('https') ? newSrc : `${ARBIMON_BASE_URL}${newSrc}`

  // Serialise tile preloads through a small global semaphore. Before this,
  // every <VisualizerTileImg> watcher fired `new Image(); image.src = url`
  // synchronously on mount, which produced N parallel requests to
  // /legacy-api/ingest/recordings/*.png. The upstream stream-asset service
  // degrades sharply under concurrency (30ms -> ~10s + sporadic 500/504),
  // and when the N onload handlers all fired in a tight cluster the main
  // thread was blocked long enough to trip the health.js-blocked watchdog
  // (#2461).
  acquireTileSlot().then(release => {
    // The watcher may have fired again while we were waiting in the queue.
    // If so, drop this slot and let the newer call own the next one.
    if (myGen !== generation) {
      release()
      return
    }
    releaseSlot = release

    const image = new Image()
    const done = () => {
      // Only release once per acquire.
      if (releaseSlot === release) {
        releaseSlot = null
        release()
      }
    }
    image.onload = () => {
      if (myGen === generation) {
        src.value = image.src
      }
      done()
    }
    image.onerror = () => {
      done()
    }
    image.src = finalUrl
  })
}, { immediate: true })

onBeforeUnmount(() => {
  cancelInFlight()
})
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

.crisp-image {
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: optimizeSpeed;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
}
</style>
