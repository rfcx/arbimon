<template>
  <template v-if="(rawMarkdownText == null || rawMarkdownText === '') && !isViewMored">
    <project-summary-empty
      v-if="editable && store.userIsAdminProjectMember"
      @emit-add-content="editMarkdownContent"
    />
    <ProjectSummaryEmptyForNonProjectMember v-else />
  </template>
  <template v-else>
    <div
      v-if="isProjectMember && !isViewingAsGuest && !isEditing"
      class="flex flex-row justify-end pr-6"
    >
      <button
        v-if="!store.userIsGuest"
        class="flex flex-row items-center btn btn-primary py-2 px-3 mb-3 disabled:hover:btn-disabled disabled:btn-disabled"
        :data-tooltip-target="!editable ? `${id}EditTextTooltipId` : null"
        data-tooltip-placement="bottom"
        :disabled="!editable"
        @click="editMarkdownContent"
      >
        <span>Edit text</span> <icon-custom-ic-edit class="ml-2 self-center" />
      </button>
      <div
        v-if="!editable"
        :id="`${id}EditTextTooltipId`"
        role="tooltip"
        class="absolute z-10 w-60 invisible inline-block px-3 py-2 text-sm font-medium text-gray-900 transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 tooltip"
      >
        {{ disableText }}
        <div
          class="tooltip-arrow"
          data-popper-arrow
        />
      </div>
    </div>
    <MarkdownViewer
      v-show="!isEditing"
      v-if="rawMarkdownText === undefined && rawMarkdownText !== ''"
      :id="`${id}-markdown-viewer-component`"
      ref="markdownViewerRef"
      :class="isViewMored === true ? 'z-0' : 'max-h-128 overflow-y-hidden z-0'"
      :expanded="isViewMored"
      :markdown="editableMarkdownText"
    />
    <div
      v-else-if="rawMarkdownText == null || rawMarkdownText === '' && !isEditing"
      class="mt-6"
    >
      <p class="text-fog text-center py-6">
        It seems the section didn’t load as expected. <br>
        Please refresh your browser to give it another go.
      </p>
    </div>
    <div>
      <button
        v-show="!isEditing && isMarkdownTextLong"
        :id="`${id}-markdown-viewer-read-more`"
        class="flex flex-row justify-start items-center px-6 py-5 bg-transparent text-frequency text-base font-normal leading-normal"
        @click="toggleExpandMarkdownContent"
      >
        {{ isViewMored === true ? 'View less' : 'View more' }}
        <icon-fa-chevron-up
          class="ml-2 text-frequency w-4 h-4"
          :class="isViewMored === true ? '' : 'transform rotate-180'"
        />
      </button>
    </div>
    <div
      v-show="isEditing && store.userIsAdminProjectMember"
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
      v-show="isEditing && store.userIsAdminProjectMember"
      :id="id"
      v-model="editableMarkdownText"
      :character-limit="props.characterLimit"
      class="mx-auto"
      :error-message="errorMessage"
      :has-failed="hasFailed"
      @on-editor-close="closeEditor"
    />
  </template>
</template>

<script setup lang="ts">
import { initTooltips } from 'flowbite'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { event } from 'vue-gtag'

import MarkdownEditor from '~/markdown/markdown-editor.vue'
import MarkdownViewer from '~/markdown/markdown-viewer.vue'
import { useStore } from '~/store'
import ProjectSummaryEmpty from './project-summary-empty.vue'
import ProjectSummaryEmptyForNonProjectMember from './project-summary-empty-for-non-project-member.vue'

const DEFAULT_CHARACTER_LIMIT = 10000

const props = withDefaults(defineProps<{ id: string, editable: boolean, rawMarkdownText: string | undefined, defaultMarkdownText: string, isViewMored: boolean, isEditing: boolean, characterLimit?: number, isProjectMember: boolean, isViewingAsGuest: boolean, errorMessage?: string, hasFailed?: boolean }>(), { characterLimit: DEFAULT_CHARACTER_LIMIT, errorMessage: '' })
const emit = defineEmits<{(e: 'on-editor-close', value: string): void, (e: 'update:isViewMored', value: boolean): void, (e: 'update:isEditing', value: boolean): void}>()

const store = useStore()
const markdownViewerRef = ref<{ markdownViewerWrapperComponent: HTMLDivElement | null } | null>(null)
const editableMarkdownText = ref(props.rawMarkdownText == null || props.rawMarkdownText === '' ? '' : unref(props.rawMarkdownText))
const disableText = ref('Contact your project administrator for permission to edit text')

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
  initTooltips()
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

const isMarkdownTextLong = computed(() => {
  return props.rawMarkdownText && props.rawMarkdownText.length > 1710
})

const toggleExpandMarkdownContent = (): void => {
  emit('update:isViewMored', !props.isViewMored)
  emit('update:isEditing', false)
}

const editMarkdownContent = (): void => {
  event('edit_content', {
    event_category: 'project_summary',
    event_label: 'edit_content',
    value: props.id
  })
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
