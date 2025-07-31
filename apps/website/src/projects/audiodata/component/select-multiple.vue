<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface Badge {
  icon: string
  value: number
}

export interface Option {
  label: string
  value: string | number
  tooltip?: string
  isSelectAll?: boolean
  badges?:Badge[]
}

const props = defineProps<{
  modelValue:(string | number)[]
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: (string | number)[]): void }>()

const selectedValues = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isOpen = ref(false)
const wrapper = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const handleClickOutside = (e: MouseEvent) => {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// ✅ Search filter
const search = ref('')
type DropdownOption = Option & { disabled?: boolean }

const filteredOptions = computed<DropdownOption[]>(() => {
  const lower = search.value.toLowerCase()

  if (selectedValues.value.includes('ALL')) {
    return props.options
      .filter(opt => opt.isSelectAll !== true)
      .map(opt => ({ ...opt, disabled: true }))
      .filter(opt => opt.label.toLowerCase().includes(lower))
  }

  return props.options
    .filter(opt => !selectedValues.value.includes(opt.value))
    .filter(opt => opt.label.toLowerCase().includes(lower))
})

const selectOption = (value: string | number) => {
  if (value === 'ALL') {
    selectedValues.value = ['ALL']
    isOpen.value = false
    return
  }

  if (selectedValues.value.includes('ALL')) {
    selectedValues.value = []
  }

  if (!selectedValues.value.includes(value)) {
    selectedValues.value = [...selectedValues.value, value]
  }

  search.value = ''
  nextTick(() => searchInput.value?.focus())
}

const removeValue = (value: string | number) => {
  selectedValues.value = selectedValues.value.filter(v => v !== value)
}

const removeAll = () => {
  selectedValues.value = []
}

const selectedOptions = computed(() =>
  props.options.filter(o => selectedValues.value.includes(o.value))
)

const selectAllOption = computed(() =>
  props.options.find(o => o.isSelectAll === true)
)

const openDropdown = () => {
  isOpen.value = true
  nextTick(() => searchInput.value?.focus())
}
</script>

<template>
  <div
    ref="wrapper"
    class="relative"
  >
    <!-- Selected tags -->
    <div
      class="input-select-multiple flex flex-wrap"
      @click="openDropdown"
    >
      <template v-if="selectedValues.includes('ALL')">
        <div class="inline-flex items-center px-[5px] py-[4px] text-[12px] rounded text-cloud bg-util-gray-04 border border-util-gray-04 mt-1 mb-[3px] ml-1 hover:bg-[#0a0a0a]">
          <span class="mr-1 font-bold">{{ selectAllOption?.label }}</span>
          <button
            class="font-bold opacity-80 hover:text-gray-200"
            @click.stop="removeAll"
          >
            ×
          </button>
        </div>
      </template>

      <template
        v-for="opt in selectedOptions"
        v-else
        :key="opt.value"
      >
        <div
          class="inline-flex items-center px-[5px] py-[4px] text-[12px] rounded text-cloud bg-util-gray-04 border border-util-gray-04 mt-1 mb-[3px] ml-1 hover:bg-[#0a0a0a]"
          :title="opt.tooltip"
        >
          <span class="mr-1 font-bold">{{ opt.label }}</span>
          <button
            class="text-white font-bold opacity-20 hover:bg-echo"
            @click.stop="removeValue(opt.value)"
          >
            ×
          </button>
        </div>
      </template>

      <input
        ref="searchInput"
        v-model="search"
        type="text"
        class="flex-1 min-w-[50px] border-none outline-none bg-transparent py-1 placeholder-insight focus:outline-none focus:shadow-none focus:ring-0 focus:ring-offset-0"
        :placeholder="!selectedOptions.length ? (placeholder || 'Search or select...') : ''"
        @focus="isOpen = true"
      >
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen && filteredOptions.length"
      class="absolute mt-1 w-full border border-util-gray-03 rounded bg-echo text-insight text-sm font-medium shadow z-10 max-h-60 overflow-y-auto"
    >
      <div
        v-for="opt in filteredOptions"
        :key="opt.value"
        class="flex justify-between items-center px-2 py-1 cursor-pointer m-2 rounded"
        :class="{
          'text-[#777] bg-moss cursor-not-allowed': opt.disabled,
          'hover:bg-moss': !opt.disabled
        }"
        @click.stop="!opt.disabled && selectOption(opt.value)"
      >
        <span
          class="truncate max-w-[75%]"
          :title="opt.label"
        >{{ opt.label }}</span>
        <span
          v-if="opt.badges?.length"
          class="badge px-1 inline-flex flex-shrink-0 items-center gap-1 bg-util-gray-03 rounded-full"
          :class="{
            'text-insight': opt.disabled
          }"
        >
          <span
            v-for="(badge, index) in opt.badges"
            :key="index"
            class="inline-flex items-center"
          >
            <span
              v-if="index"
              class="mr-1 text-xs"
            >/</span>
            <icon-fa-check
              v-if="badge.icon === 'val-1'"
              class="h-3 w-3 text-[#1F57CC]"
            />
            <icon-fa-close
              v-if="badge.icon === 'val-0'"
              class="h-2.5 w-2.5 text-[#ffcd00]"
            />
            <span class="text-xs ml-1">{{ badge.value }}</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-select-multiple {
  @apply bg-echo text-insight w-full rounded text-sm placeholder-insight border border-util-gray-03;
}
input::placeholder {
  @apply text-[14px];
}
</style>
