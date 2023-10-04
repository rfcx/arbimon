<template>
  <div>
    <div class="grid gap-1 bg-white">
      <icon-custom-ft-undo class="text-black" />
      <icon-custom-ft-redo class="text-black" />
      <select
        id="markdown-editor-heading-selector"
        class="bg-white text-black text-sm rounded-lg block p-2.5 w-32 border-none"
      >
        <option value="h1">
          <h1>Heading 1</h1>
        </option>
        <option value="h2">
          <h2>Heading 2</h2>
        </option>
        <option value="h3">
          <h3>Heading 3</h3>
        </option>
        <option value="h4">
          <h4>Heading 4</h4>
        </option>
        <option value="h5">
          <h5>Heading 5</h5>
        </option>
        <option value="h6">
          <h6>Heading 6</h6>
        </option>
        <option value="p">
          <p>Paragraph</p>
        </option>
      </select>
      <icon-custom-ft-bold class="text-black" />
      <icon-custom-ft-italic class="text-black" />
      <icon-custom-ft-underline class="text-black" />
      <icon-custom-ft-bulleted-list class="text-black" />
      <icon-custom-ft-numbered-list class="text-black" />
      <icon-custom-ft-link class="text-black" />
    </div>
    <EditorContent
      id="markdown-content"
      class="bg-white"
      :editor="editor"
    />
  </div>
</template>

<script setup lang="ts">
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Markdown } from 'tiptap-markdown'
import { watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{(e: 'update:modelValue', value: string): void}>()

watch(() => props.modelValue, (newValue) => {
  if (editor.value?.storage.markdown.getMarkdown() === newValue) {
    return
  }

  editor.value?.commands.setContent(newValue, false)
})

const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown
  ],
  content: props.modelValue,
  onUpdate: () => {
    emit('update:modelValue', editor.value?.storage.markdown.getMarkdown() ?? '')
  }
})
</script>
