<template>
  <div
    v-if="!content"
    class="italic"
  >
    No information found.
  </div>
  <div v-else>
    <span
      ref="speciesInfoContentRef"
      class="mr-1 inline-block"
      :class="{ [`line-clamp-5`]: !isExpanded }"
    >
      {{ props.content }}
    </span>
    <span
      v-if="hasMoreThanMaxLine"
      class="cursor-pointer rounded-sm underline inline hover:() text-sm"
      @click="expandInformation()"
    >
      {{ isExpanded ? 'Read less' : 'Read more' }}
    </span>
    <span
      class="mr-1 text-right text-subtle inline"
    >
      &mdash; <a
        :href="redirectUrl"
        target="_blank"
        class="opacity-80 hover:(underline opacity-70)"
        :class="{ 'pointer-events-none': !props.redirectUrl }"
      >
        Source: {{ props.source }}
      </a>
    </span>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUpdated, ref, watch, withDefaults } from 'vue'

const props = withDefaults(defineProps<{
  content: string
  redirectUrl: string
  source: string
}>(), {
  content: '',
  redirectUrl: '',
  source: ''
})

const isExpanded = ref(false)
const hasMoreThanMaxLine = ref(false)
const firstRender = ref(false)
const speciesInfoContentRef = ref<HTMLSpanElement | null>(null)

onMounted(() => {
  calculateMaxLine()
  firstRender.value = true
  window.addEventListener('resize', onWindowSizeChange)
})

onUpdated(() => {
  calculateMaxLine()
  firstRender.value = false
})

watch(() => props.content, () => {
  isExpanded.value = false
  calculateMaxLine()
})

const onWindowSizeChange = () => {
  isExpanded.value = false
  hasMoreThanMaxLine.value = true
  calculateMaxLine()
}

const calculateMaxLine = () => {
  if (!speciesInfoContentRef.value) return
  if (isExpanded.value && speciesInfoContentRef.value.clientHeight > 109) {
    hasMoreThanMaxLine.value = true
    return
  }
  hasMoreThanMaxLine.value = speciesInfoContentRef.value.scrollHeight > speciesInfoContentRef.value.clientHeight
}

const expandInformation = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<script lang="ts">
export default {
  name: 'SpeciesInformationContent' // Name to support class component
}
</script>
