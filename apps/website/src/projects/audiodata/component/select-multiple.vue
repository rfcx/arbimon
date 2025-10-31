<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface Badge {
  icon: string
  value: number
}

export interface Option {
  label: string
  value: string | number
  group?: string
  tooltip?: string
  isSelectAll?: boolean
  badges?:Badge[]
  count?: number
  tagIcon?: boolean
  icon?: string
}

const props = defineProps<{
  modelValue:(string | number)[]
  options: Option[]
  placeholder?: string
  hideAfterSelected?: boolean
  error?: string
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: (string | number)[]): void }>()

const selectedValues = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isOpen = ref(false)
const wrapper = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const hasError = computed(() => !!props.error)

const handleClickOutside = (e: MouseEvent) => {
  if (wrapper.value && !wrapper.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

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

const groupedOptions = computed(() => {
  const groups = new Map<string, DropdownOption[]>()
  for (const opt of filteredOptions.value) {
    const key = opt.group || '__nogroup'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(opt)
  }
  return groups
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

  if (props.hideAfterSelected) {
    isOpen.value = false
    return
  }

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

const valueKeys = ['{"model":1, "th":1}', '{"model":1, "th":0}', '{"model":0, "th":1}', '{"model":0, "th":0}']
function haveValuekey (key: string): boolean {
  return valueKeys.includes(key)
}

</script>

<template>
  <div
    id="selectMultiple"
    ref="wrapper"
    class="relative"
  >
    <div
      class="input-select-multiple flex flex-wrap overflow-y-auto pr-1"
      :class="hasError ? 'border-[#d94b5a] ring-1 ring-[#d94b5a]' : 'border-util-gray-03'"
      :aria-invalid="hasError ? 'true' : 'false'"
      @click="openDropdown"
    >
      <template v-if="selectedValues.includes('ALL')">
        <div class="inline-flex items-center px-[5px] py-[4px] text-[12px] rounded rounde-xl font-display text-cloud bg-util-gray-04 border border-util-gray-04 mt-1 mb-[3px] ml-1 hover:bg-[#0a0a0a] hover:border-[#0a0a0a]">
          <span class="mr-1 font-bold">{{ selectAllOption?.label }}</span>
          <button
            class="text-white font-bold opacity-20 hover:bg-echo text-[18px]"
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
          class="inline-flex items-center px-[5px] py-[4px] text-[12px] rounded rounde-xl font-display text-cloud bg-util-gray-04 border border-util-gray-04 mt-1 mb-[3px] ml-1 hover:bg-[#0a0a0a] hover:border-[#0a0a0a]"
          :title="opt.tooltip"
        >
          <icon-fa-check
            v-if="opt.icon === 'val-1'"
            class="h-3 w-3 text-[#1F57CC] mr-1"
          />
          <icon-fa-close
            v-if="opt.icon === 'val-0'"
            class="h-2.5 w-2.5 text-[#ffcd00] mr-1"
          />
          <icon-fa-tag
            v-if="opt.icon === 'tag-icon'"
            class="text-[10px]"
          />
          <div
            v-if="haveValuekey(opt.value.toString())"
            class="mt-[2px] mr-1 font-bold"
          >
            <span>
              Model:
              <icon-fa-check
                v-if="opt.label.includes('Model: present')"
                class="h-3 w-3 text-[#1F57CC] inline-block mr-1 mb-[3px]"
              />
              <icon-fa-close
                v-else
                class="h-2.5 w-2.5 text-[#ffcd00] inline-block mr-1 mb-[3px]"
              />
              Threshold:
              <icon-fa-check
                v-if="opt.label.includes('Threshold: present')"
                class="h-3 w-3 text-[#1F57CC] inline-block mr-1 mb-[3px]"
              />
              <icon-fa-close
                v-else
                class="h-2.5 w-2.5 text-[#ffcd00] inline-block mr-1 mb-[3px]"
              />
            </span>
          </div>
          <div v-else>
            <span
              v-if="opt.group"
              class="mr-1 font-bold"
            >{{ opt.group }} / {{ opt.label }}</span>
            <span
              v-else
              class="mr-1 font-bold"
            >{{ opt.label }}</span>
          </div>
          <span
            v-if="opt.count && opt.icon === 'tag-icon'"
            class="badge px-1 inline-flex flex-shrink-0 items-center gap-1 bg-util-gray-03 rounded-full mr-1"
          >
            <span class="text-xs mx-0.5">{{ opt.count }}</span>
          </span>
          <button
            class="text-white font-bold opacity-20 hover:bg-echo text-[18px]"
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
        class="flex-1 min-w-[100px] border-none outline-none bg-transparent py-1 placeholder-insight focus:outline-none focus:shadow-none focus:ring-0 focus:ring-offset-0"
        :placeholder="!selectedOptions.length ? (placeholder || 'Search or select...') : ''"
        @focus="isOpen = true"
      >
    </div>
    <p
      v-if="hasError"
      class="mt-2 flex items-center gap-2 text-[#d94b5a] text-[12px]"
    >
      <icon-custom-alert-triangle class="h-[13px] w-[13px] cursor-pointer" />
      <span>{{ props.error }}</span>
    </p>
    <div
      v-if="isOpen && filteredOptions.length"
      class="absolute mt-1 w-full border border-util-gray-03 rounded bg-echo text-insight text-sm font-medium shadow z-10 max-h-60 overflow-y-auto"
    >
      <template
        v-for="[groupName, opts] in groupedOptions"
        :key="groupName"
      >
        <div
          v-if="groupName !== '__nogroup'"
          class="mt-1 px-3 py-1 text-xs text-gray-400 uppercase font-semibold"
        >
          {{ groupName }}
        </div>
        <div
          v-for="opt in opts"
          :key="opt.value"
          class="flex justify-between items-center px-2 py-1 cursor-pointer m-2 rounded"
          :class="{
            'text-[#777] bg-moss cursor-not-allowed': opt.disabled,
            'hover:bg-moss': !opt.disabled
          }"
          @click.stop="!opt.disabled && selectOption(opt.value)"
        >
          <div
            class="inline-flex  items-center"
            :class="{ 'max-w-[75%]': opt.badges }"
          >
            <icon-fa-tag
              v-if="opt.tagIcon === true"
              class="text-[10px]"
            />
            <icon-fa-check
              v-if="opt.icon === 'val-1'"
              class="h-3 w-3 text-[#1F57CC] mr-1"
            />
            <icon-fa-close
              v-if="opt.icon === 'val-0'"
              class="h-2.5 w-2.5 text-[#ffcd00] mr-1"
            />
            <div
              v-if="haveValuekey(opt.value.toString())"
              class="mt-[2px] mr-1 font-bold"
            >
              <span>
                Model:
                <icon-fa-check
                  v-if="opt.label.includes('Model: present')"
                  class="h-3 w-3 text-[#1F57CC] inline-block mr-1 mb-[3px]"
                />
                <icon-fa-close
                  v-else
                  class="h-2.5 w-2.5 text-[#ffcd00] inline-block mr-1 mb-[3px]"
                />
                Threshold:
                <icon-fa-check
                  v-if="opt.label.includes('Threshold: present')"
                  class="h-3 w-3 text-[#1F57CC] inline-block mr-1 mb-[3px]"
                />
                <icon-fa-close
                  v-else
                  class="h-2.5 w-2.5 text-[#ffcd00] inline-block mr-1 mb-[3px]"
                />
              </span>
            </div>
            <div v-else>
              <span
                class="truncate "
                :title="opt.label"
              >{{ opt.label }}</span>
            </div>
          </div>

          <span
            v-if="opt.count"
            class="badge px-1 inline-flex flex-shrink-0 items-center gap-1 bg-util-gray-03 rounded-full"
          >
            <span class="text-xs mx-0.5">{{ opt.count }}</span>
          </span>

          <span
            v-if="opt.badges?.length"
            class="badge px-1 inline-flex flex-shrink-0 items-center gap-1 bg-util-gray-03 rounded-full"
            :class="{ 'text-insight': opt.disabled }"
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
      </template>
    </div>
  </div>
</template>

<style scoped>
.input-select-multiple {
  @apply bg-echo text-insight w-full rounded rounded-md text-sm placeholder-insight border;
  --chip-h: 28px;
  --line-gap: 6px;
  max-height: calc(var(--chip-h) * 3 + var(--line-gap) * 2 + 8px);
}

.input-select-multiple > * {
  white-space: nowrap;
}

input::placeholder {
  @apply text-[14px];
}

input::placeholder { @apply text-[14px] text-gray-400; }
</style>
