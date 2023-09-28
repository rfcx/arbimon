<template>
  <div ref="toastUiEditor" />
</template>

<script setup lang="ts">
import Editor from '@toast-ui/editor'
import type { EventMap } from '@toast-ui/editor/dist/toastui-editor-viewer'
import { type Ref, onMounted, onUnmounted, ref } from 'vue'

import '@toast-ui/editor/dist/toastui-editor.css'

type EditorEvents = keyof EventMap

const editorEvents = ref<EditorEvents[]>([
  'load',
  'change',
  'caretChange',
  'focus',
  'blur',
  'keydown',
  'keyup',
  'beforePreviewRender',
  'beforeConvertWysiwygToMarkdown'
])

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{(event: 'update:modelValue', value: string): void}>()

const toastUiEditor = ref<HTMLDivElement>() as Ref<HTMLDivElement>
const editor = ref<Editor | null>(null)

onMounted(() => {
  editor.value = new Editor({
    el: toastUiEditor.value,
    initialEditType: 'wysiwyg',
    initialValue: props.modelValue,
    height: '300px',
    events: {
      change: () => emit('update:modelValue', editor.value?.getMarkdown() ?? '')
    }
  })
})

onUnmounted(() => {
  editorEvents.value.forEach(ev => {
    editor.value?.off(ev)
  })

  editor.value?.destroy()
})
</script>
