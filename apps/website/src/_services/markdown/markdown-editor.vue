<template>
  <div>
    <div
      id="markdown-editor-controls"
      class="flex flex-row flex-wrap gap-2 lg:justify-center bg-white rounded-t-lg pb-2 pt-4 border border-b-neutral-500"
    >
      <button
        title="Undo"
        type="button"
        :class="editor?.isActive('undo') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        :disabled="!editor?.can().chain().focus().undo().run() ?? false"
        @click="editor?.chain().focus().undo().run()"
      >
        <icon-custom-ft-undo />
      </button>
      <button
        title="Redo"
        type="button"
        :class="editor?.isActive('redo') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        :disabled="!editor?.can().chain().focus().redo().run() ?? false"
        @click="editor?.chain().focus().redo().run()"
      >
        <icon-custom-ft-redo />
      </button>
      <button
        title="Heading 1"
        type="button"
        :class="editor?.isActive('heading', { level: 1 }) ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        title="Heading 2"
        type="button"
        :class="editor?.isActive('heading', { level: 2 }) ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        title="Heading 3"
        type="button"
        :class="editor?.isActive('heading', { level: 3 }) ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <button
        title="Heading 4"
        type="button"
        :class="editor?.isActive('heading', { level: 4 }) ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleHeading({ level: 4 }).run()"
      >
        H4
      </button>
      <button
        title="Heading 5"
        type="button"
        :class="editor?.isActive('heading', { level: 5 }) ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleHeading({ level: 5 }).run()"
      >
        H5
      </button>
      <button
        title="Heading 6"
        type="button"
        :class="editor?.isActive('heading', { level: 6 }) ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleHeading({ level: 6 }).run()"
      >
        H6
      </button>
      <button
        title="Paragraph"
        type="button"
        :class="editor?.isActive('paragraph') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().setParagraph().run()"
      >
        P
      </button>
      <button
        title="Bold"
        type="button"
        :class="editor?.isActive('bold') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo flex justify-center items-center disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white flex justify-center items-center disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        :disabled="!editor?.can().chain().focus().toggleBold().run()"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <icon-custom-ft-bold />
      </button>
      <button
        title="Italic"
        type="button"
        :class="editor?.isActive('italic') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo flex justify-center items-center disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white flex justify-center items-center disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        :disabled="!editor?.can().chain().focus().toggleItalic().run()"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <icon-custom-ft-italic />
      </button>
      <button
        title="Bulleted list"
        type="button"
        :class="editor?.isActive('bulletList') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <icon-custom-ft-bulleted-list />
      </button>
      <button
        title="Numbered list"
        type="button"
        :class="editor?.isActive('orderedList') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <icon-custom-ft-numbered-list />
      </button>
      <button
        title="Link"
        :class="editor?.isActive('link') ? 'w-8 h-8 flex-shrink-0 rounded-lg text-white bg-echo disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed' : 'w-8 h-8 flex-shrink-0 rounded-lg text-black bg-white disabled:bg-white disabled:text-black disabled:opacity-50 disabled:cursor-not-allowed'"
        data-modal-target="markdown-editor-insert-link-modal"
        data-modal-toggle="markdown-editor-insert-link-modal"
        type="button"
        @click="openModalToSetLink"
      >
        <icon-custom-ft-link />
      </button>
    </div>
    <EditorContent
      id="markdown-editor-content"
      class="bg-white select-auto selection:bg-fog"
      :editor="editor"
    />
    <div
      id="markdown-editor-character-remaining"
      class="text-right text-sm bg-white text-util-gray-02 rounded-b-lg pr-4 pb-2 mb-4"
    >
      <i>{{ editor?.storage.characterCount.characters() }}/{{ characterLimit }} Characters Remaining</i>
    </div>

    <div
      id="markdown-editor-save-edit"
      class="text-right flex flex-row-reverse justify-start items-center"
    >
      <button
        type="button"
        class="bg-frequency text-black text-base font-medium rounded-4xl px-4 py-2"
        @click="$emit('onEditorClose')"
      >
        Save changes
      </button>
      <span
        v-if="props.onSaveErrorMessage !== ''"
        class="p-4 text-sm text-red-800 dark:text-flamingo"
        role="alert"
      >
        <span class="font-medium">Failed. {{ props.onSaveErrorMessage }}</span>
      </span>
    </div>

    <!-- insert link modal -->
    <div
      :id="`${id}-markdown-editor-insert-link-modal`"
      data-modal-backdrop="static"
      tabindex="-1"
      aria-hidden="true"
      class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
    >
      <div class="relative w-full max-w-2xl max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-echo">
          <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Link
            </h3>
            <button
              type="button"
              class="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              :data-modal-hide="`${id}-markdown-editor-insert-link-modal`"
              @click="closeModal"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-6 space-y-6">
            <p class="text-base leading-relaxed text-gray-500 dark:text-white">
              Enter a URL
            </p>
            <input
              v-model="linkToSet"
              class="text-black rounded-lg w-72"
              type="text"
            >
          </div>
          <!-- Modal footer -->
          <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              :data-modal-hide="`${id}-markdown-editor-insert-link-modal`"
              type="button"
              class="text-black bg-frequency font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              @click="confirmSetLink"
            >
              Ok
            </button>
            <button
              :data-modal-hide="`${id}-markdown-editor-insert-link-modal`"
              type="button"
              class="text-white bg-echo rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5"
              @click="closeModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Modal } from 'flowbite'
import { Markdown } from 'tiptap-markdown'
import { type Ref, onMounted, ref, watch } from 'vue'

const props = defineProps<{ id: string, modelValue: string, characterLimit: number, onSaveErrorMessage: string }>()
const emit = defineEmits<{(e: 'update:modelValue', value: string): void, (e: 'onEditorClose'): void}>()
const modal = ref() as Ref<Modal>
const linkToSet = ref('')

watch(() => props.modelValue, (newValue) => {
  if (editor.value?.storage.markdown.getMarkdown() === newValue) {
    return
  }

  editor.value?.commands.setContent(newValue, false)
})

const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown,
    Link,
    CharacterCount.configure({
      limit: props.characterLimit
    })
  ],
  content: props.modelValue,
  onUpdate: () => {
    emit('update:modelValue', editor.value?.storage.markdown.getMarkdown() ?? '')
  }
})

onMounted(() => {
  modal.value = new Modal(document.getElementById(`${props.id}-markdown-editor-insert-link-modal`), {
    placement: 'center',
    backdrop: 'dynamic',
    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
    closable: false
  })
})

const openModalToSetLink = (): void => {
  const previousUrl: string | undefined = editor.value?.getAttributes('link').href

  // sets to old link first
  linkToSet.value = previousUrl ?? ''
  modal.value.show()
}

const confirmSetLink = (): void => {
  // get link from the modal. If empty string is passed. Unlink the given link
  if (linkToSet.value === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  // Otherwise set the highlighted text to the given link. Then reset the link.
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkToSet.value }).run()
  closeModal()
}

const closeModal = (): void => {
  modal.value.hide()
  linkToSet.value = ''
}
</script>

<style lang="scss">
.ProseMirror:focus {
  outline: none;
}

.tiptap {
  @apply p-6 text-black;

  a {
    @apply text-green-600 hover:underline hover:cursor-pointer;
  }

  ol {
    @apply list-decimal pl-6;
  }

  ul {
    @apply list-disc pl-6;
  }

  p, ul, ol {
    @apply mt-0 mb-4;
  }

  li > p {
    @apply mb-0;
  }
}
</style>
