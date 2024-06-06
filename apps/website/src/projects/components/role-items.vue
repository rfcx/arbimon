<template>
  <div :class="{ 'mt-3': !hideIfGuest || role.id !== 'guest' }">
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
            v-if="!ifUnavailable"
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
              v-if="getPermission(item.access) === 'allow'"
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
  items: { title: string, access: { id: string, permission: string }[] }[],
  title: string,
  hideIfGuest?: boolean,
  reduceOpacity?: boolean,
  ifUnavailable?: boolean
  closeIfUnavailable?: boolean
}>()

const isOpen = ref(!props.ifUnavailable)

const toggleSection = () => {
  isOpen.value = !isOpen.value
}

const getPermission = (accessList: { id: string, permission: string }[]): string => {
  const access = accessList.find(access => access.id === props.role.id)
  return access ? access.permission : 'impervious'
}

function capitalizeFirstLetter (input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1)
}
</script>
