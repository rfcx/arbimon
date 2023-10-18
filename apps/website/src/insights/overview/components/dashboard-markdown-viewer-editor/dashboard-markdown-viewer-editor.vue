<template>
  <div
    v-show="!isViewMored"
    id="markdown-viewer-mask"
    class="absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-hidden bg-gradient-to-b from-transparent to-echo z-10"
  />
  <MarkdownViewer
    v-show="!isEditing"
    id="markdown-viewer-component"
    :class="isViewMored === true ? 'z-0' : 'max-h-52 overflow-y-hidden z-0'"
    :markdown="editableMarkdownText"
  />
  <button
    id="markdown-viewer-edit-button"
    class="absolute lg:right-4 top-0 z-20 hover:block hidden"
    @click="editMarkdownContent"
  >
    <icon-custom-fi-edit />
  </button>
  <button
    id="markdown-viewer-read-more"
    :class="isViewMored === true ? 'bg-transparent absolute left-12 bottom-4 text-frequency text-base font-normal leading-normal z-20 hidden' : 'bg-transparent absolute left-12 bottom-4 text-frequency text-base font-normal leading-normal z-20'"
    @click="emit('update:isViewMored', true)"
  >
    <span>
      View More <icon-custom-arrow-right class="text-frequency inline-block" />
    </span>
  </button>
  <MarkdownEditor
    v-show="isEditing"
    v-model="editableMarkdownText"
    :character-limit="props.characterLimit"
    class="mx-auto"
    @on-editor-close="closeEditor"
  />
</template>

<script setup lang="ts">
import { toRef } from 'vue'

import MarkdownEditor from '~/markdown/markdown-editor.vue'
import MarkdownViewer from '~/markdown/markdown-viewer.vue'

const props = withDefaults(defineProps<{ markdownText: string, isViewMored: boolean, isEditing: boolean, characterLimit?: number }>(), { characterLimit: 1000 })
const emit = defineEmits<{(e: 'on-editor-close', value: string): void, (e: 'update:isViewMored', value: boolean): void, (e: 'update:isEditing', value: boolean): void}>()

const editableMarkdownText = toRef(props.markdownText)

const editMarkdownContent = (): void => {
  emit('update:isEditing', true)
  emit('update:isViewMored', true)
}

const closeEditor = (): void => {
  emit('on-editor-close', editableMarkdownText.value)
}
</script>

<style lang="scss">
div#markdown-viewer-mask:hover ~ button#markdown-viewer-edit-button {
  display: block;
}

div#markdown-viewer-component:hover + button#markdown-viewer-edit-button {
  display: block;
}

div#markdown-viewer-mask + button#markdown-viewer-edit-button {
  display: none;
}

button#markdown-viewer-edit-button:hover {
  display: block !important;
}
</style>
