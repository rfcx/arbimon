<template>
  <div
    v-if="!content"
    class="italic"
  >
    No information found.
  </div>
  <div v-else>
    <span
      id="species-info-content"
      class="mr-1"
      :class="{ [`line-clamp-${MAX_LINES}`]: !isExpanded }"
    >
      {{ props.content }}
    </span>
    <span
      v-if="hasMoreThanMaxLine"
      class="mr-1 px-3 py-1 bg-box-grey cursor-pointer rounded-sm underline inline hover:() text-sm"
      @click="expandInformation()"
    >{{ isExpanded ? 'Read less' : 'Read more' }}</span>
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
import { defineProps, onMounted, ref, watch, withDefaults } from 'vue'

const MAX_LINES = 5

interface Props {
  content: string
  redirectUrl: string
  source: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  redirectUrl: '',
  source: ''
})

const isExpanded = ref(false)
const hasMoreThanMaxLine = ref(false)

onMounted(() => {
  window.addEventListener('resize', onWindowSizeChange)
})

watch(props, () => {
  isExpanded.value = false
  calculateMaxLine()
})

const onWindowSizeChange = () => {
  isExpanded.value = false
  hasMoreThanMaxLine.value = true
  calculateMaxLine()
}

const calculateMaxLine = () => {
  const element = document.getElementById('species-info-content')
  if (!element) return

  const hasMoreThanMaxLineInternal = element.scrollHeight > element.clientHeight
  hasMoreThanMaxLine.value = hasMoreThanMaxLineInternal
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
