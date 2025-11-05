<template>
  <div
    ref="root"
    class="relative"
    @keydown.stop="onKeydown"
  >
    <div
      class="h-[34px] flex items-center border rounded cursor-text text-insight bg-util-gray-04 border-util-gray-04 hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
      role="combobox"
      :aria-expanded="open"
      @click="toggle(true)"
    >
      <span
        v-if="!open"
        class="flex-1 text-insight min-w-0 p-2 flex items-center"
      >
        <icon-fa-map-marker
          v-show="showMapIcon"
          class="w-2 h-4 mr-2 my-2"
        />
        <span class="truncate">
          {{ selectedLabel || placeholder }}
        </span>

      </span>
      <input
        v-else
        ref="inputEl"
        v-model="search"
        type="search"
        class="flex-1 h-[34px] outline-none text-insight rounded bg-transparent focus:ring-0 border-0 hover:(text-insight bg-[#0a0a0a] border-[#0a0a0a])"
        :placeholder="placeholder"
        autocomplete="off"
      >
      <icon-fa-chevron-down
        v-if="!open"
        data-accordion-icon
        class="w-[9px] h-[9px] mr-2 fa-chevron-up"
      />
    </div>

    <ul
      v-show="open"
      :id="listboxId"
      class="absolute z-50 mt-1 max-h-60 overflow-auto rounded bg-pitch border border-util-gray-04"
      :class="{'w-full' : wFull}"
      role="listbox"
    >
      <li
        v-if="filtered.length === 0"
        class="px-3 py-2 text-insight"
      >
        No results
      </li>

      <li
        v-for="(opt, i) in filtered"
        :key="opt.value"
        role="option"
        :aria-selected="i === hi"
        class="m-1 cursor-pointer rounded flex items-center justify-between text-[14px] min-w-[200px]"
        :class="i === hi ? 'bg-moss text-white' : 'text-insight hover:bg-echo'"
        @mouseenter="hi = i"
        @mousedown.prevent="select(opt)"
      >
        <div class="flex items-center gap-1 min-w-0 px-2 p-1">
          <icon-fa-map-marker
            v-show="showMapIcon"
            class="w-2 h-4 mr-1 shrink-0"
          />
          <span class="truncate py-1">{{ opt.label }}</span>
        </div>
        <span
          v-show="showMapIcon"
          class="shrink-0 tabular-nums ml-1 bg-util-gray-03 rounded-full px-2 py-1 mr-1 text-[12px] font-bold"
        >{{ opt.count ?? 0 }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type OptionObject = { label: string; value: string | number; count?: number }
type InputOption = string | number | OptionObject

const props = defineProps<{
  modelValue: string | number | undefined
  options: InputOption[]
  placeholder?: string
  showMapIcon?: boolean
  wFull?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue':[string | number | null] }>()

const placeholder = props.placeholder ?? 'Select...'
const open = ref(false)
const search = ref('')
const hi = ref(0) // highlighted index

const root = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const listboxId = `lb-${Math.random().toString(36).slice(2, 8)}`

const normalizedOptions = computed<OptionObject[]>(() =>
  props.options.map((o) => {
    if (typeof o === 'object') {
      const obj = o as OptionObject
      return { label: String(obj.label), value: obj.value, count: obj.count ?? 0 }
    }
    return { label: String(o), value: o, count: 0 }
  })
)

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find(o => o.value === props.modelValue)
  return found?.label ?? ''
})

const filtered = computed<OptionObject[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return normalizedOptions.value
  return normalizedOptions.value.filter(o => o.label.toLowerCase().includes(q))
})

watch(open, (v) => {
  if (v) {
    search.value = ''
    const idx = Math.max(0, filtered.value.findIndex(o => o.value === props.modelValue))
    hi.value = idx === -1 ? 0 : idx
    requestAnimationFrame(() => inputEl.value?.focus())
  }
})

function toggle (v?: boolean) {
  open.value = typeof v === 'boolean' ? v : !open.value
}
function close () { open.value = false }

function select (o: OptionObject) {
  emit('update:modelValue', o.value)
  close()
}

function onKeydown (e: KeyboardEvent) {
  if (!open.value && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
    e.preventDefault()
    toggle(true)
    return
  }
  if (!open.value) return

  if (filtered.value.length === 0) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    hi.value = Math.min(hi.value + 1, filtered.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    hi.value = Math.max(hi.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const o = filtered.value[hi.value]
    if (o != null) select(o)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

function clickOutside (ev: MouseEvent) {
  if (!root.value) return
  if (!root.value.contains(ev.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', clickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', clickOutside))
</script>
