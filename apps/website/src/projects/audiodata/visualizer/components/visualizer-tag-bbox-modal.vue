<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 isolate flex items-center justify-center ml-120"
  >
    <div class="bg-moss rounded-xl shadow-lg max-w-md w-full p-6">
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-2xl font-header">
            {{ title }}
          </h2>
          <button
            type="button"
            title="Cancel"
            @click="$emit('cancel')"
          >
            <icon-custom-fi-close-thin class="h-6 w-6 cursor-pointer text-insight" />
          </button>
        </div>
        <div class="relative dropdown flex flex-col gap-4">
          <div
            id="searchItemDropdownTrigger"
            ref="dropdownTrigger"
            class="flex relative items-center"
            data-dropdown-toggle="searchItemDropdown"
            @focusin="openDropdown"
          >
            <input
              :value="keyword"
              class="block bg-moss border-util-gray-03 rounded-md w-full placeholder:text-insight focus:(border-frequency ring-frequency)"
              type="text"
              :placeholder="'Add' + listName + 's to this region.'"
              @focus="hasFocusInput = true"
              @blur="hasFocusInput = false"
            >
            <span
              class="absolute right-4 cursor-pointer"
            >
              <icon-fa-chevron-down
                v-if="selectedItem === null"
                class="w-3 h-3 fa-chevron-down text-util-gray-03"
                :class="hasFocusInput ? 'transform rotate-180' : ''"
              />
              <svg
                v-else
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
                @click="onClearInput()"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </span>
          </div>
          <div
            id="searchItemDropdown"
            ref="dropdownMenu"
            class="absolute hidden w-5/6 t-5 left-4 top-10 z-15 bg-white rounded-md shadow dark:bg-moss mt-2 border-util-gray-03 border-1 max-h-45 overflow-y-auto"
          >
            <ul class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md">
              <template v-if="items && items.length === 0">
                <li
                  v-if="items.length === 0"
                  class="rounded-lg p-4 text-center text-sm"
                >
                  No matching {{ listName }}s
                </li>
              </template>
              <template v-else>
                <li
                  v-for="item in items"
                  :key="item.id"
                  :label="item.label"
                  class="cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-sm"
                  @click="onSelected(item)"
                >
                  {{ item.label }}
                </li>
              </template>
            </ul>
          </div>
        </div>
        <div class="flex flex-row items-center gap-x-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { initDropdowns } from 'flowbite'
import { nextTick, onMounted, ref } from 'vue'

import { type BboxListItem, type BboxListItems } from '../types'

defineProps<{
  keyword: string
  visible: boolean
  title: string
  listName?: string
  items: BboxListItems | undefined
}>()

const emits = defineEmits<{(e: 'cancel'): void, (e: 'emitSelectedItem', value: BboxListItem): void}>()

const dropdownTrigger = ref<HTMLElement | null>(null)
const dropdownMenu = ref<HTMLElement | null>(null)
const selectedItem = ref<BboxListItem | null>(null)
const hasFocusInput = ref(false)

const onClearInput = () => {
  selectedItem.value = null
}

const onSelected = (item: BboxListItem) => {
  selectedItem.value = item
  emits('emitSelectedItem', selectedItem.value)
}

const openDropdown = async () => {
  await nextTick()
  initDropdowns()
}

onMounted(() => {
  initDropdowns()
})

</script>
