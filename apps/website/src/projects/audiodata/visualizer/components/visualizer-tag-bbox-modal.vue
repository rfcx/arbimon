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
            id="tagBtn"
            class="flex relative items-center"
            data-dropdown-toggle="tagDropdown"
            aria-expanded="false"
            aria-haspopup="true"
            data-dropdown-trigger="hover"
            data-dropdown-placement="bottom"
            @focusin="openDropdown"
          >
            <input
              v-model="tagKeyword"
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
            id="tagDropdown"
            class="absolute hidden w-5/6 t-5 left-4 top-10 z-15 bg-white rounded-md shadow dark:bg-moss mt-2 border-util-gray-03 border-1 max-h-45 overflow-y-auto"
          >
            <ul
              aria-labelledby="tagBtn"
              aria-orientation="vertical"
              role="menu"
              tabindex="-1"
              class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md"
            >
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
                  :label="item.text"
                  class="flex flex-row items-center cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-sm"
                  @click="onSelected(item)"
                >
                  <icon-fa-tag class="text-[10px] mr-1" />
                  {{ item.text }}
                </li>
              </template>
            </ul>
          </div>
        </div>
        <div class="flex flex-row items-center justify-between gap-x-4">
          <button
            class="px-4 py-2 btn btn-secondary btn-medium"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 btn btn-primary btn-medium disabled:(cursor-not-allowed opacity-50)"
            :disabled="selectedItem === null"
            @click="emitSelectedItem"
          >
            Add Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { AxiosInstance } from 'axios'
import { Dropdown, initDropdowns } from 'flowbite'
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'

import { apiClientArbimonLegacyKey } from '@/globals'
import { useStore } from '~/store'
import { useGetTags } from '../../_composables/use-recordings'
import { useSearchTag } from '../../_composables/use-visualizer'
import { type BboxTagItem } from '../types'

defineProps<{
  visible: boolean
  title: string
  listName?: string
}>()

const emits = defineEmits<{(e: 'cancel'): void,
  (e: 'emitSelectedItem', value: BboxTagItem): void
}>()

const store = useStore()
const selectedProjectSlug = computed(() => store.project?.slug)
const selectedItem = ref<BboxTagItem | null>(null)
const hasFocusInput = ref(false)
const tagKeyword = ref<string>('')
const tagKeywordParams = computed(() => tagKeyword.value || '')
const apiClientArbimon = inject(apiClientArbimonLegacyKey) as AxiosInstance
const tagDropdownMenu = ref<HTMLElement | null>(null)
let tagDropdownInput: Dropdown

const { data: searchedTags, refetch: refetchSearchTags, isRefetching } = useSearchTag(apiClientArbimon, selectedProjectSlug, tagKeywordParams)
const { data: projectTags } = useGetTags(apiClientArbimon, selectedProjectSlug)

const items = computed<BboxTagItem[]>(() => {
  const base =
    tagKeyword.value?.length
      ? searchedTags.value
      : projectTags.value

  const mapped: BboxTagItem[] =
    base?.map(tag => ({
      id: tag.tag_id,
      text: tag.tag
    })) ?? []

  const keyword = tagKeyword.value?.trim()
  if (!keyword) return mapped

  const exists = mapped.some(
    item => item.text.toLowerCase() === keyword.toLowerCase()
  )

  return exists
    ? mapped
    : [{ text: keyword }, ...mapped]
})

const onClearInput = () => {
  selectedItem.value = null
  tagKeyword.value = ''
}

const onSelected = (item: BboxTagItem) => {
  selectedItem.value = item
  tagKeyword.value = selectedItem.value.text
  tagDropdownInput.hide()
}

const emitSelectedItem = () => {
  if (selectedItem.value === null) return
  emits('emitSelectedItem', selectedItem.value)
}

const openDropdown = async () => {
  await nextTick()
  initDropdowns()
  await nextTick()
  initDropdowns()
  tagDropdownMenu.value = document.getElementById('tagDropdown')
  tagDropdownInput = new Dropdown(
    document.getElementById('tagDropdown'),
    document.getElementById('tagBtn')
  )
}

watch(() => tagKeyword.value, () => {
  if ((tagKeyword.value.length && tagKeyword.value.length > 1) || isRefetching.value === true) {
    refetchSearchTags()
  }
})

onMounted(async () => {
  await nextTick()
  initDropdowns()
})

</script>
