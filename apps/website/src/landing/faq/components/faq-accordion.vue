<template>
  <h2 :id="slugify(question)">
    <button
      type="button"
      class="flex items-center justify-between w-full p-4 text-left text-insight border-b-1 border-util-gray-01 bg-transparent focus:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
      :data-accordion-target="'#accordion-open-body-' + itemId"
      aria-expanded="true"
      :aria-controls="'accordion-open-body-' + itemId"
      @click="$emit('toggle-answer', itemId)"
    >
      <div class="text-lg lg:text-xl font-medium">
        {{ question }}
      </div>
      <svg
        data-accordion-icon
        class="w-3 h-3 rotate-180 shrink-0"
        aria-hidden="true"
        width="14"
        height="17"
        viewBox="0 0 14 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 9.33789L1.1875 8.13477L6.14062 13.0879L6.14062 0.259766H7.85938L7.85938 13.0879L12.7969 8.13477L14 9.33789L7 16.3379L0 9.33789Z"
          fill="#ADFF2C"
        />
      </svg>
    </button>
  </h2>
  <div
    :id="'accordion-open-body-' + itemId"
    :class="isAnswerOpened ? 'shown' : ''"
    :aria-labelledby="slugify(question)"
  >
    <Markdown
      id="faq-accordion-markdown-body"
      class="px-4 py-8 font-base"
      :source="answer"
    />
  </div>
</template>

<script setup lang="ts">
import Markdown from 'vue3-markdown-it'

import { slugify } from '../utils'

defineProps<{
  itemId: number
  question: string
  answer: string
  isAnswerOpened: boolean
}>()

defineEmits<{(e: 'toggle-answer', itemId: number): void}>()
</script>

<style lang="scss">
div#faq-accordion-markdown-body {
  h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  h2:not(:first-child) {
    margin-top: 1.25rem;
  }

  p:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  ul {
    list-style-type: square;
    margin-left: 1.25rem;
  }

  a:hover {
    -webkit-text-decoration-line: underline;
    text-decoration-line: underline;
  }

  // INFO: Checkout https://stackoverflow.com/a/4094151/12386405 for how I did it
  table {
    border-collapse: separate;
    border-spacing: 0;
  }

  table td, table th {
    @apply px-4 py-1;
  }

  table th {
    @apply border-1 border-solid border-frequency;
  }

  table th:first-child {
    border-right: none;
  }

  table th:last-child {
    border-left: none;
  }

  table th:not(:first-child):not(:last-child) {
    border-left: none;
    border-right: none;
  }

  table tr:first-child th:first-child {
    @apply rounded-tl-2xl;
  }

  table tr:first-child th:last-child {
    @apply rounded-tr-2xl;
  }

  table tr td:first-child {
    @apply border-l-1 border-l-solid border-l-frequency;
  }

  table tr td:last-child {
    @apply border-r-1 border-r-solid border-r-frequency;
  }

  table tr:last-child td {
    @apply border-b-1 border-b-solid border-b-frequency;
  }

  table tr:last-child td:first-child {
    @apply rounded-bl-2xl;
  }

  table tr:last-child td:last-child {
    @apply rounded-br-2xl;
  }
}
</style>
