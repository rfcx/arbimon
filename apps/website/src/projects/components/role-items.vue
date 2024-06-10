<template>
  <div :class="!hideIfGuest || role.id !== 'guest' ? 'mt-3' : ''">
    <div
      class="flex flex-col bg-moss gap-y-3 border-gray-200 dark:border-gray-700 p-3 rounded-lg"
      :style="{ opacity: reduceOpacity ? '0.7' : '1' }"
    >
      <div>
        <div
          class="flex flex-row cursor-pointer h-7 items-center justify-between"
          @click="toggleSection()"
        >
          <h6
            v-if="!isUnavailable"
            class="font-medium"
          >
            {{ title }}
          </h6>
          <h6 v-else>
            {{ title }} (Unavailable to {{ capitalizeFirstLetter(role.id) }})
          </h6>
          <icon-fa-chevron-down
            v-if="!isOpen"
            class="w-3 h-3 fa-chevron-down"
          />
          <icon-fa-chevron-up
            v-else
            class="w-3 h-3 fa-chevron-up"
          />
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
            <span class="text-sm">
              {{ item.title }}
            </span>
            <icon-fa-check
              v-if="hasAccess(item)"
              class="text-frequency text-sm"
            />
            <icon-fa-close
              v-else
              class="text-ibis"
            />
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
