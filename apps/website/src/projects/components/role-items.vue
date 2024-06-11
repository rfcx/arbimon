<template>
  <div :class="!hideIfGuest || role.id !== 'guest' ? 'mt-3' : ''">
    <div
      class="flex flex-col bg-echo gap-y-3 border-gray-200 dark:border-gray-700 py-3 px-6 rounded-lg"
      :style="{ opacity: reduceOpacity ? '0.7' : '1'}"
    >
      <div>
        <div
          class="flex flex-row cursor-pointer py-2 items-center justify-between"
          :style="{ height: !isOpen ? '20px' : '12px' }"
          @click="toggleSection()"
        >
          <h6
            v-if="!isUnavailable"
            class="font-medium"
          >
            {{ title }}
          </h6>
          <h6
            v-else
            class="font-medium"
          >
            {{ title }} (Unavailable to {{ capitalizeFirstLetter(role.id) }})
          </h6>
          <svg
            v-if="!isOpen"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 15L12 9L6 15"
              stroke="#FFFEFC"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <svg
            v-else
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#FFFEFC"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <ul
          v-if="isOpen"
          class="mt-4 border-t-1 border-util-gray-03"
        >
          <li
            v-for="(item, index) in items"
            :key="index"
            class="my-3 flex flex-row justify-between"
          >
            <span class="text-sm h-5">
              {{ item.title }}
            </span>
            <svg
              v-if="hasAccess(item)"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="#ADFF2C"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="#A31A33"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#A31A33"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  role: { id: string },
  items: { title: string, access: Record<string, boolean> }[],
  title: string,
  hideIfGuest?: boolean,
  reduceOpacity?: boolean,
  isUnavailable?: boolean
  closeIfUnavailable?: boolean
}>()

const isOpen = ref(!props.isUnavailable)

const toggleSection = () => {
  isOpen.value = !isOpen.value
}

const hasAccess = (item: { title: string, access: Record<string, boolean> }): boolean => {
  return props.role.id !== undefined && item.access[props.role.id]
}

function capitalizeFirstLetter (input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1)
}
</script>
