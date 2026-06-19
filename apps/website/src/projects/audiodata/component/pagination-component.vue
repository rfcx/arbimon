<template>
  <div class="flex items-center flex-wrap text-white">
    <button
      :disabled="currentPage === 1"
      class="pagination-btn rounded-tl-[3px] rounded-bl-[3px]"
      @click="goToPage(1)"
    >
      First
    </button>
    <button
      :disabled="currentPage === 1"
      class="pagination-btn"
      @click="goToPage(currentPage - 1)"
    >
      Prev
    </button>

    <button
      v-if="startPage > 1"
      class="pagination-btn"
      @click="goToPage(startPage - 1)"
    >
      ...
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      :class="['pagination-btn', { 'bg-util-gray-03': page === currentPage }]"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <button
      v-if="endPage < totalPages"
      class="pagination-btn"
      @click="goToPage(endPage + 1)"
    >
      ...
    </button>

    <button
      :disabled="currentPage === totalPages"
      class="pagination-btn"
      @click="goToPage(currentPage + 1)"
    >
      Next
    </button>
    <button
      :disabled="currentPage === totalPages"
      class="pagination-btn rounded-tr-[3px] rounded-br-[3px]"
      @click="goToPage(totalPages)"
    >
      Last
    </button>
    <div
      v-if="hideJumpPage !== true"
      class="flex items-center"
    >
      <label class="ml-4 font-bold text-sm">Jump to:</label>
      <select
        :value="currentPage"
        class="w-20 px-2 py-1 ml-1 bg-black border border-util-gray-03 rounded text-sm focus:border-util-gray-03 focus:outline-none focus:shadow-none focus:ring-0 focus:ring-offset-0"
        @change="onJumpSelect"
      >
        <option
          v-for="page in totalPages"
          :key="page"
          :value="page"
        >
          {{ page }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  maxPagesToShow?: number
  hideJumpPage?: boolean
}>()

const emit = defineEmits<{(e: 'update:currentPage', value: number): void }>()

const maxPagesToShow = props.maxPagesToShow ?? 10

const onJumpSelect = (e: Event) => {
  const page = Number((e.target as HTMLSelectElement).value)
  goToPage(page)
}

const goToPage = (page: number) => {
  if (page < 1 || page > props.totalPages) return
  emit('update:currentPage', page)
}

const startPage = computed(() => {
  return Math.floor((props.currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1
})

const endPage = computed(() => {
  return Math.min(startPage.value + maxPagesToShow - 1, props.totalPages)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = startPage.value; i <= endPage.value; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<style scoped>
.pagination-btn {
  @apply px-3 py-1 border border-util-gray-03 text-white text-xs hover:bg-util-gray-04 disabled:cursor-not-allowed;
}
</style>
