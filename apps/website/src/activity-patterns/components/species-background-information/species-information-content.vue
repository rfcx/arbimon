<template>
  <div class="col-span-3 pr-6">
    <p
      ref="paragraph"
      class="informaion-content"
      :class="isExpanded ? 'expanded' : 'collapse'"
    >
      <span
        v-if="!content"
        class="italic"
      >
        No information found.
      </span>
      {{ props.content }}
      <span
        class="mt-2 text-right text-subtle"
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
    </p>
    <div
      v-if="hasReadMore"
      class="readmore"
      @click="onReadmore"
    >
      {{ !isExpanded ? 'read me' : 'read less' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, withDefaults } from 'vue'

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
const paragraph = ref<HTMLParagraphElement>()
const isExpanded = ref(false)
const hasReadMore = ref(true)
const onReadmore = () => {
  isExpanded.value = !isExpanded.value
}

</script >

<script lang="ts">
  export default {
    name: 'SpeciesInformationContent' // Name to support class component
  }
</script>

<style lang="scss">
$base-color: #141525;
.informaion-content {
  &.collapse {
    max-height: 110px;
    overflow: hidden;
  }
  &.expanded {
    max-height: unset;
    &+.readmore {
      box-shadow: unset;
      &:hover {
        box-shadow: 0 -14px 13px 0 $base-color;
      }
    }
  }
}
.readmore {
  text-align: center;
  min-height: 25px;
  cursor: pointer;
  filter: opacity(1);
  box-shadow: 0 -14px 13px 0 $base-color;
  &:hover {
    opacity: .7;
  }
}
</style>
