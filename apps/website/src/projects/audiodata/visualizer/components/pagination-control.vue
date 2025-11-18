<template>
  <div
    v-if="lastPage >= 0"
    class="w-full py-2 font-header text-[12px]"
  >
    <nav
      class="w-full flex items-center justify-between"
      aria-label="Pagination"
    >
      <div class="inline-flex overflow-hidden rounded-[3px] bg-[#4b4b4b]">
        <button
          class="px-2 py-1 text-frequency disabled:opacity-40 disabled:cursor-not-allowed
                 rounded-none first:rounded-l-[3px] last:rounded-r-[3px]"
          :disabled="isAtFirstPage"
          aria-label="First page"
          @click="go('first')"
        >
          «
        </button>
        <button
          class="px-2 py-1 text-frequency disabled:opacity-40 disabled:cursor-not-allowed
                 rounded-none first:rounded-l-[3px] last:rounded-r-[3px]"
          :disabled="isAtFirstPage"
          aria-label="Previous page"
          @click="go('previous')"
        >
          ‹
        </button>
      </div>

      <div class="inline-flex overflow-hidden rounded-[3px] bg-[#4b4b4b]">
        <button
          v-for="p in pageBlock"
          :key="p"
          class="min-w-[16px] px-2 py-1
                 rounded-none first:border-l-0 first:rounded-l-[3px] last:rounded-r-[3px]
                 text-frequency hover:bg-[#34332b]"
          :class="{
            'bg-[#0A0A0A] text-white': currentPage === p
          }"
          @click="go(p)"
        >
          {{ p + 1 }}
        </button>
      </div>

      <div class="inline-flex overflow-hidden rounded-[3px] bg-[#4b4b4b]">
        <button
          class="px-2 py-1 text-frequency disabled:opacity-40 disabled:cursor-not-allowed
                 rounded-none first:rounded-l-[3px] last:rounded-r-[3px]"
          :disabled="isAtLastPage"
          aria-label="Next page"
          @click="go('next')"
        >
          ›
        </button>
        <button
          class="px-2 py-1 text-frequency disabled:opacity-40 disabled:cursor-not-allowed
                 rounded-none first:rounded-l-[3px] last:rounded-r-[3px]"
          :disabled="isAtLastPage"
          aria-label="Last page"
          @click="go('last')"
        >
          »
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Action = 'first' | 'previous' | 'next' | 'last' | number

const props = withDefaults(defineProps<{
  modelValue: number
  totalItems: number
  pageSize: number
}>(), {})

const emit = defineEmits<{(e: 'update:modelValue', value: number): void, (e: 'change', value: number): void }>()

const currentPage = computed(() => props.modelValue)
const lastPage = computed(() =>
  Math.max(0, Math.ceil((props.totalItems || 0) / (props.pageSize || 1)) - 1)
)

const isAtFirstPage = computed(() => currentPage.value <= 0)
const isAtLastPage = computed(() => currentPage.value >= lastPage.value)

const digits = computed(() => String(currentPage.value + 1).length)
const blockSize = computed(() => (digits.value < 3 ? 7 : 5))

const pageBlock = computed<number[]>(() => {
  if (lastPage.value < 0) return []

  const size = blockSize.value
  const half = Math.floor(size / 2)

  let start = Math.max(0, currentPage.value - half)
  let end = start + size - 1

  if (end > lastPage.value) {
    end = lastPage.value
    start = Math.max(0, end - size + 1)
  }

  const pages: number[] = []
  for (let p = start; p <= end; p++) {
    pages.push(p)
  }
  return pages
})

function clamp (n: number) {
  return Math.min(Math.max(n, 0), lastPage.value)
}

function go (action: Action) {
  let next = currentPage.value

  switch (action) {
    case 'first': next = 0; break
    case 'previous': next = currentPage.value - 1; break
    case 'next': next = currentPage.value + 1; break
    case 'last': next = lastPage.value; break
    default: next = action
  }

  next = clamp(next)
  if (next !== currentPage.value) {
    emit('update:modelValue', next)
    emit('change', next)
  }
}
</script>
