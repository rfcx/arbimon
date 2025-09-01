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
      Previous
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

    <label class="ml-4 font-bold text-sm">Jump to page:</label>
    <input
      v-model.number="jumpPage"
      type="number"
      min="1"
      :max="totalPages"
      class="no-spinner w-16 px-2 py-1 ml-1 bg-black border border-util-gray-03 rounded text-sm focus:border-util-gray-03 focus:outline-none focus:shadow-none focus:ring-0 focus:ring-offset-0"
    >
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash.debounce'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  maxPagesToShow?: number
}>()

const emit = defineEmits<{(e: 'update:currentPage', value: number): void }>()

const maxPagesToShow = props.maxPagesToShow ?? 10

const jumpPage = ref(props.currentPage)

watch(() => props.currentPage, (val) => {
  jumpPage.value = val
})

watch(jumpPage, (val) => {
  if (val !== props.currentPage && val >= 1 && val <= props.totalPages) {
    debouncedGoToPage(val)
  }
})

const debouncedGoToPage = debounce((page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    goToPage(page)
  }
}, 600)

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

/* Chrome, Safari, Edge, Opera */
input[type='number'].no-spinner::-webkit-outer-spin-button,
input[type='number'].no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'].no-spinner {
  -moz-appearance: textfield;
  appearance: textfield;
}

</style>
