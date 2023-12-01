<template>
  <template v-if="(rawMarkdownText == null || rawMarkdownText === '') && !isViewMored">
    <project-summary-empty
      v-if="editable"
      @emit-add-content="editMarkdownContent"
    />
    <ProjectSummaryEmptyGuestView v-else />
  </template>
  <template v-else>
    <MarkdownViewer
      v-show="!isEditing"
      :id="`${id}-markdown-viewer-component`"
      ref="markdownViewerRef"
      :class="isViewMored === true ? 'z-0' : 'max-h-128 overflow-y-hidden z-0'"
      :expanded="isViewMored"
      :markdown="editableMarkdownText"
    />
    <button
      v-show="!isEditing"
      :id="`${id}-markdown-viewer-read-more`"
      :class="isViewMored === true ? 'bg-transparent absolute left-1/2 right-1/2 bottom-6 text-frequency text-base font-normal leading-normal z-20' : 'bg-transparent absolute left-1/2 right-1/2 bottom-6 text-frequency text-base font-normal leading-normal z-20'"
      @click="toggleExpandMarkdownContent"
    >
      <icon-custom-fi-arrow-up :class="isViewMored === true ? 'text-frequency inline-block' : 'text-frequency inline-block transform rotate-180'" />
    </button>
    <div
      v-show="!isEditing"
      class="flex flex-row justify-end mt-4"
    >
      <button
        :class="editable ? 'btn btn-secondary py-1.5 px-3 disabled:cursor-not-allowed' : 'invisible disabled:cursor-not-allowed'"
        :disabled="projectUserPermissionsStore.isGuest"
        @click="editMarkdownContent"
      >
        <span class="text-sm font-display font-medium">
          Edit text
        </span>
        <icon-custom-fi-edit class="w-4 h-4 ml-3 inline-flex text-frequency" />
      </button>
    </div>
    <div
      v-show="isEditing"
      id="markdown-editor-apply-template"
      class="flex flex-row justify-start items-center gap-x-3 mb-4"
    >
      <p class="text-white text-base font-normal font-sans leading-normal">
        Provide some context about the project.
      </p>
      <button
        class="btn btn-secondary px-3 py-2 text-sm font-medium leading-none"
        @click="applyTemplateText"
      >
        Use a template
      </button>
    </div>
    <MarkdownEditor
      v-show="isEditing"
      :id="id"
      v-model="editableMarkdownText"
      :character-limit="props.characterLimit"
      class="mx-auto"
      @on-editor-close="closeEditor"
    />
  </template>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, unref, watch } from 'vue'

import MarkdownEditor from '~/markdown/markdown-editor.vue'
import MarkdownViewer from '~/markdown/markdown-viewer.vue'
import { useProjectUserPermissionsStore } from '~/store'
import ProjectSummaryEmpty from './project-summary-empty.vue'
import ProjectSummaryEmptyGuestView from './project-summary-empty-guest-view.vue'

const DEFAULT_CHARACTER_LIMIT = 10000

const props = withDefaults(defineProps<{ id: string, editable: boolean, rawMarkdownText: string | undefined, defaultMarkdownText: string, isViewMored: boolean, isEditing: boolean, characterLimit?: number, isProjectMember: boolean, isViewingAsGuest: boolean }>(), { characterLimit: DEFAULT_CHARACTER_LIMIT })
const emit = defineEmits<{(e: 'on-editor-close', value: string): void, (e: 'update:isViewMored', value: boolean): void, (e: 'update:isEditing', value: boolean): void}>()

const projectUserPermissionsStore = useProjectUserPermissionsStore()
const markdownViewerRef = ref<{ markdownViewerWrapperComponent: HTMLDivElement | null } | null>(null)
const editableMarkdownText = ref(props.rawMarkdownText == null || props.rawMarkdownText === '' ? '' : unref(props.rawMarkdownText))

watch(() => props.rawMarkdownText, value => {
  if (value != null && value !== '') {
    // Do not allow overriding new value from the api while user's editing.
    if (props.isEditing) {
      return
    }

    editableMarkdownText.value = value
  }
})

onMounted(async () => {
  await nextTick(() => {
    const scrollHeight = markdownViewerRef.value?.markdownViewerWrapperComponent?.scrollHeight ?? 0
    const clientHeight = markdownViewerRef.value?.markdownViewerWrapperComponent?.clientHeight ?? 0

    // Invisible divs will return those as 0
    if (scrollHeight === 0 && clientHeight === 0) {
      return
    }

    // If statement below could result in weird expanded div without any content inside so this is needed.
    if (props.rawMarkdownText === '') {
      emit('update:isViewMored', false)
    }

    if (scrollHeight > clientHeight) {
      emit('update:isViewMored', false)
    } else {
      emit('update:isViewMored', true)
    }
  })
})

const toggleExpandMarkdownContent = (): void => {
  emit('update:isViewMored', !props.isViewMored)
  emit('update:isEditing', false)
}

const editMarkdownContent = (): void => {
  emit('update:isEditing', true)
  emit('update:isViewMored', true)
}

const closeEditor = (): void => {
  emit('on-editor-close', editableMarkdownText.value)
}

const applyTemplateText = (): void => {
  editableMarkdownText.value = props.defaultMarkdownText
}
</script>
